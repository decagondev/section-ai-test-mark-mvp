import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { glob } from 'glob';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const DEFAULT_FILE_GLOBS = [
  'README.md',
  'readme.md',
  'package.json',
  'index.js', 'index.ts', 'app.js', 'app.ts', 'server.js', 'server.ts',
  'src/**/*.js', 'src/**/*.ts',
  'routes/**/*.js', 'routes/**/*.ts',
  'controllers/**/*.js', 'controllers/**/*.ts',
  'middleware/**/*.js', 'middleware/**/*.ts'
];

export const openaiService = {
  async analyzeCode(repoPath: string, testResult: any, rubric?: any, fileGlobs?: string[], npmRegistryData?: Record<string, string>, projectType?: string) {
    const files = await readRepoFiles(repoPath, fileGlobs || DEFAULT_FILE_GLOBS);
    const prompt = buildPrompt(files, testResult, rubric, npmRegistryData, projectType);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.2,
      });

      const content = response.choices[0].message.content as string;
      if (projectType === 'c') {
        console.log('LLM raw response for C project:', content);
      }
      const analysis = safeJsonParse(content);
      if (projectType === 'c') {
        let codeSmellScore = analysis.codeSmellScore;
        let codeQualityScore = analysis.codeQualityScore;
        if (typeof codeSmellScore !== 'number' || typeof codeQualityScore !== 'number') {
          console.warn('LLM did not return codeSmellScore or codeQualityScore. Defaulting to 0. Raw:', content);
          codeSmellScore = 0;
          codeQualityScore = 0;
        }
        return {
          codeSmellScore,
          codeQualityScore,
          report: analysis.report || 'No analysis provided',
          breakdown: [
            { category: 'Code Quality', score: codeQualityScore, maxScore: 100, feedback: 'LLM code quality score' },
            { category: 'Code Smell', score: codeSmellScore, maxScore: 100, feedback: 'LLM code smell score' }
          ]
        };
      }
      return {
        score: analysis.score || 0,
        report: analysis.report || 'No analysis provided'
      };
    } catch (error: any) {
      if (projectType === 'c') {
        return {
          codeSmellScore: 0,
          codeQualityScore: 0,
          report: `AI analysis failed: ${error.message}`,
          breakdown: [
            { category: 'Code Quality', score: 0, maxScore: 100, feedback: 'LLM code quality score' },
            { category: 'Code Smell', score: 0, maxScore: 100, feedback: 'LLM code smell score' }
          ]
        };
      }
      return {
        score: 0,
        report: `AI analysis failed: ${error.message}`
      };
    }
  }
};

async function readRepoFiles(repoPath: string, fileGlobs: string[]): Promise<string> {
  let fileContents = '';
  const matchedFiles = new Set<string>();
  for (const pattern of fileGlobs) {
    const matches = await glob(pattern, { cwd: repoPath, absolute: true, nodir: true });
    matches.forEach(f => matchedFiles.add(f));
  }
  for (const file of matchedFiles) {
    try {
      let content = await fs.readFile(file, 'utf-8');
      content = sanitizeCode(content);
      if (content.length > 10000) content = content.slice(0, 10000) + '\n// ...truncated...';
      fileContents += `// ${path.relative(repoPath, file)}\n${content}\n\n`;
    } catch {}
  }
  return fileContents;
}

function sanitizeCode(code: string): string {
  return code.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');
}

function buildPrompt(files: string, testResult: any, rubric?: any, npmRegistryData?: Record<string, string>, projectType?: string): string {
  if (projectType === 'c') {
    return `
You are an expert C/C++ code reviewer. 

**IMPORTANT**: When analyzing dependencies or external libraries, avoid making specific claims about which version is "latest" as this information may be outdated. Instead, focus on identifying potentially outdated components and recommend checking for updates without specifying exact version numbers.

**DOCUMENTATION**: Where appropriate, include relevant documentation links (e.g., official docs, best practices guides) to help students learn more about the concepts discussed. When suggesting package updates, include links to the official documentation for those packages.

You must output a JSON object with the following fields:
- "codeQualityScore": number (0-100)
- "codeSmellScore": number (0-100)
- "report": string (markdown, see below)

Your markdown report **must** follow this comprehensive structure. Use the following detailed template as a strict guide (do not include any triple backticks or code blocks in your output):

--- Detailed C/C++ Template ---
# Code Review Report: <project-name>

## Summary Table
| Metric            | Score |
|-------------------|-------|
| Code Quality      | <score> |
| Code Smell        | <score> |

## Repository Overview
Provide a comprehensive overview of the C/C++ project including:
- Purpose and functionality of the library/application
- Target platform and compilation requirements
- Key files and their roles (headers, source, examples, tests)
- Build system and dependencies
- Current state and maintenance status
- Notable features or limitations

## Code Quality Assessment
### Strengths
- List 3-5 specific strengths with detailed explanations
- Focus on architectural decisions, code organization, and C/C++ best practices
- Mention any innovative algorithms, efficient implementations, or well-designed interfaces
- Highlight portability, performance, or maintainability advantages

### Weaknesses
- List 3-5 specific weaknesses with detailed explanations
- Include memory management issues, security vulnerabilities, and maintainability problems
- Reference specific code patterns, architectural decisions, or C/C++ anti-patterns
- Address platform-specific issues or portability concerns

### Code Quality Score: <score>/100
Break down the score into specific categories:
- **Correctness (25 points)**: Functionality, error handling, edge cases, undefined behavior
- **Readability (25 points)**: Code clarity, naming conventions, documentation, comments
- **Maintainability (25 points)**: Code structure, modularity, complexity, coupling
- **Performance (25 points)**: Efficiency, memory usage, algorithmic complexity, scalability

## Code Smell Assessment
### Identified Code Smells
Provide detailed analysis of code smells specific to C/C++:

**Memory Management Smells:**
- Memory leaks (missing free/delete calls)
- Double-free errors
- Use-after-free vulnerabilities
- Buffer overflows and underflows
- Improper array bounds checking

**C/C++ Specific Smells:**
- Global variables and state
- Magic numbers and hardcoded constants
- Macro overuse and unsafe macros
- Inconsistent error handling patterns
- Platform-specific code without abstraction
- Unsafe type casting and conversions
- Missing const correctness
- Inefficient string handling

**Architectural Smells:**
- Tight coupling between modules
- Circular dependencies
- God objects or functions
- Inconsistent naming conventions
- Mixed abstraction levels

### Code Smell Score: <score>/100
- **Severity (50 points)**: Impact on correctness, security, and maintainability
- **Maintainability (50 points)**: Effect on code evolution and debugging

## Detailed Code Analysis
### Header Files (.h)
Analyze header file quality:
- **Include Guards**: Proper #ifndef/#define/#endif usage
- **Forward Declarations**: Minimizing compilation dependencies
- **Function Declarations**: Completeness and consistency
- **Documentation**: Comments and usage examples
- **Dependencies**: Minimizing external includes

### Source Files (.c/.cpp)
Evaluate implementation quality:
- **Function Implementation**: Completeness and correctness
- **Error Handling**: Consistent error reporting and recovery
- **Memory Management**: Proper allocation and deallocation
- **Algorithm Efficiency**: Time and space complexity
- **Code Organization**: Logical structure and flow

### Build System
Analyze build configuration:
- **Makefile/CMake**: Proper dependency management
- **Compiler Flags**: Optimization and warning settings
- **Platform Support**: Cross-platform compatibility
- **Dependencies**: External library management and version considerations

### Code Examples
Provide specific code examples with detailed analysis:

**Example 1: Memory Management Issues**
\`\`\`c
// Current problematic code
char* create_buffer(int size) {
    char* buffer = malloc(size);
    // Missing: check if malloc succeeded
    return buffer;
}

void process_data() {
    char* data = create_buffer(1024);
    // Use data...
    // Missing: free(data) - memory leak
}

// Issues: No error checking, memory leaks, potential crashes

// Suggested improvement
char* create_buffer(int size) {
    if (size <= 0) {
        return NULL;
    }
    char* buffer = malloc(size);
    if (buffer == NULL) {
        fprintf(stderr, "Failed to allocate memory\\n");
        return NULL;
    }
    return buffer;
}

void process_data() {
    char* data = create_buffer(1024);
    if (data == NULL) {
        return; // Handle allocation failure
    }
    // Use data...
    free(data); // Proper cleanup
}
\`\`\`

**Example 2: Error Handling**
\`\`\`c
// Current problematic code
int open_file(const char* filename) {
    FILE* file = fopen(filename, "r");
    return fileno(file); // No error checking
}

// Issues: No validation, undefined behavior on failure

// Suggested improvement
int open_file(const char* filename) {
    if (filename == NULL) {
        errno = EINVAL;
        return -1;
    }
    
    FILE* file = fopen(filename, "r");
    if (file == NULL) {
        return -1; // errno set by fopen
    }
    
    int fd = fileno(file);
    if (fd == -1) {
        fclose(file);
        return -1;
    }
    
    return fd;
}
\`\`\`

### Documentation
Evaluate project documentation:
- **README Quality**: Setup instructions, usage examples, API overview
- **Header Documentation**: Function descriptions, parameter details, return values
- **Code Comments**: Inline documentation and complex algorithm explanations
- **Build Instructions**: Compilation steps and dependency installation
- **License Information**: Proper licensing and usage rights

### Security Analysis
Identify security concerns specific to C/C++:
- **Buffer Overflows**: Array bounds checking and string handling
- **Memory Corruption**: Use-after-free, double-free, uninitialized memory
- **Integer Overflow**: Arithmetic operations and type conversions
- **Format String Vulnerabilities**: printf-family function usage
- **Race Conditions**: Thread safety and synchronization
- **Input Validation**: Parameter checking and sanitization

### Performance Considerations
Analyze performance aspects:
- **Algorithm Complexity**: Time and space efficiency
- **Memory Usage**: Allocation patterns and fragmentation
- **Cache Locality**: Data structure design and access patterns
- **Compiler Optimization**: Code that enables compiler optimizations
- **Platform-Specific Optimizations**: Architecture-specific improvements

## Suggested Fixes
Provide actionable, prioritized recommendations:

### High Priority (Critical Issues)
1. **Memory Safety**: Fix memory leaks, buffer overflows, and use-after-free errors (see [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/))
2. **Error Handling**: Implement consistent error checking and reporting
3. **Input Validation**: Add parameter validation and bounds checking

### Medium Priority (Quality Issues)
1. **Code Organization**: Refactor for better modularity and maintainability
2. **Documentation**: Improve comments, README, and API documentation
3. **Build System**: Enhance Makefile/CMake for better dependency management and version control

### Low Priority (Enhancement)
1. **Performance Optimization**: Algorithm improvements and memory efficiency
2. **Platform Support**: Cross-platform compatibility and portability
3. **Testing**: Add unit tests and integration tests

## Conclusion
Provide a comprehensive summary:
- **Overall Assessment**: Project strengths and critical C/C++ issues
- **Production Readiness**: Whether the code is safe for production use
- **Next Steps**: Prioritized action plan for improvement
- **Learning Opportunities**: Key C/C++ concepts to focus on

**IMPORTANT:**
- If you do not include both codeQualityScore and codeSmellScore as top-level JSON fields, your response will be considered invalid.
- The markdown report must follow the detailed structure above with comprehensive C/C++ analysis.
- Include specific code examples and actionable recommendations.
- Do NOT include any text outside the JSON object.
- If you must include newlines in the report, use \n.

## Code
${files}

## Rubric
${rubric ? JSON.stringify(rubric, null, 2) : 'Default grading criteria'}

## Output Format
{ "codeQualityScore": number, "codeSmellScore": number, "report": "..." }
`;
  }
  return `
You are an expert code reviewer for ${projectType || 'JavaScript/TypeScript/React/Express'} educational projects. Analyze the following code for quality, best practices, maintainability, and test results. Consider the test results and (if provided) the rubric.

**IMPORTANT**: When analyzing dependencies, avoid making specific claims about which version is "latest" as this information may be outdated. Instead, focus on identifying potentially outdated packages and recommend checking for updates without specifying exact version numbers.

**DOCUMENTATION**: Where appropriate, include relevant documentation links (e.g., official docs, best practices guides) to help students learn more about the concepts discussed. When suggesting package updates, include links to the official documentation for those packages.

You must output a JSON object with the following fields:
- "codeQualityScore": number (0-100)
- "testScore": number (0-100, based on test results if available, otherwise 0)
- "report": string (markdown, see below)

Your markdown report **must** follow this comprehensive structure. Use the following detailed template as a strict guide (do not include any triple backticks or code blocks in your output):

--- Detailed Template ---
# Code Review Report: <project-name>

## Summary Table
| Metric         | Score |
|---------------|-------|
| Code Quality  | <score> |
| Test Results  | <score> |

## Repository Overview
Provide a comprehensive overview of the project including:
- Purpose and functionality
- Technology stack and dependencies
- Repository structure and key files
- Current state and maintenance status
- Any notable features or limitations

## Code Quality Assessment
### Strengths
- List 3-5 specific strengths with detailed explanations
- Focus on architectural decisions, code organization, and best practices
- Mention any innovative or well-implemented features

### Weaknesses
- List 3-5 specific weaknesses with detailed explanations
- Include security concerns, performance issues, and maintainability problems
- Reference specific code patterns or architectural decisions

### Code Quality Score: <score>/100
Break down the score into specific categories:
- **Correctness (25 points)**: Functionality, error handling, edge cases
- **Readability (25 points)**: Code clarity, naming conventions, documentation
- **Maintainability (25 points)**: Code structure, modularity, complexity
- **Performance (25 points)**: Efficiency, resource usage, scalability

## Test Results Assessment
Provide detailed analysis of testing:
- Test coverage and quality
- Test organization and structure
- Missing test scenarios
- Test reliability and maintainability

### Test Score: <score>/100

## Detailed Code Analysis
### Dependencies
Analyze the project's dependencies:
- **Version Analysis**: Identify potentially outdated packages and recommend checking for updates
- **Security Concerns**: Identify potentially vulnerable packages
- **Dependency Management**: Evaluate package.json structure and lock files
- **Unused Dependencies**: Identify unnecessary packages
- **Missing Dependencies**: Suggest important packages that should be included

**Example Analysis**:
\`\`\`json
{
  "dependencies": {
    "express": "^4.18.2",  // Potentially outdated - recommend checking for latest stable version ([Express.js docs](https://expressjs.com/))
    "jsonwebtoken": "^8.5.1"  // May have security vulnerabilities - recommend updating ([JWT docs](https://github.com/auth0/node-jsonwebtoken))
  }
}
\`\`\`

### Scripts
Evaluate the project's npm scripts:
- **Development Scripts**: Analyze dev, start, and build processes
- **Testing Scripts**: Review test execution and coverage
- **Security Scripts**: Check for security scanning and dependency updates
- **CI/CD Integration**: Evaluate deployment and automation scripts

### Code Examples
Provide specific code examples with detailed analysis:

**Example 1: Error Handling**
\`\`\`javascript
// Current problematic code
router.get('/users/:id', (req, res) => {
  const user = getUserById(req.params.id);
  res.json(user);
});

// Issues: No error handling, no validation, potential crashes

// Suggested improvement
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});
\`\`\`

**Example 2: Input Validation**
\`\`\`javascript
// Current problematic code
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  saveUser(email, password);
  res.status(201).json({ message: 'User created' });
});

// Issues: No validation, security risks, poor error handling

// Suggested improvement with Yup validation
const userSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required()
});

router.post('/register', async (req, res, next) => {
  try {
    await userSchema.validate(req.body, { abortEarly: false });
    const { email, password } = req.body;
    await saveUser(email, password);
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    next(error);
  }
});
\`\`\`

### Documentation
Evaluate project documentation:
- **README Quality**: Completeness, clarity, and usefulness
- **API Documentation**: Endpoint descriptions and examples
- **Setup Instructions**: Installation and configuration guides
- **Contributing Guidelines**: Development workflow and standards
- **License Information**: Proper licensing and usage rights

### Security Analysis
Identify security concerns:
- **Authentication**: JWT implementation, token management
- **Authorization**: Role-based access control
- **Input Validation**: Data sanitization and validation
- **Dependency Security**: Known vulnerabilities in packages
- **Environment Variables**: Sensitive data handling

### Performance Considerations
Analyze performance aspects:
- **Database Queries**: Efficiency and optimization
- **Caching Strategy**: Redis usage and cache management
- **Middleware Optimization**: Request processing efficiency
- **Resource Usage**: Memory and CPU utilization
- **Scalability**: Horizontal and vertical scaling potential

## Suggested Fixes
Provide actionable, prioritized recommendations:

### High Priority
1. **Update Dependencies**: Upgrade to latest stable versions and add security scanning
2. **Implement Testing**: Add comprehensive test suite with Jest/Mocha (see [Jest documentation](https://jestjs.io/docs/getting-started))
3. **Improve Error Handling**: Add global error handling and validation

### Medium Priority
1. **Enhance Documentation**: Expand README with setup and API documentation
2. **Add CI/CD**: Implement GitHub Actions for automated testing
3. **Security Hardening**: Implement proper authentication and authorization

### Low Priority
1. **Code Optimization**: Refactor for better performance
2. **Monitoring**: Add logging and health checks
3. **Documentation**: Add inline code comments and JSDoc

## Conclusion
Provide a comprehensive summary:
- **Overall Assessment**: Project strengths and critical issues
- **Recommendation**: Whether the project is ready for production
- **Next Steps**: Prioritized action plan for improvement
- **Learning Opportunities**: Key areas for skill development

**IMPORTANT:**
- If you do not include both codeQualityScore and testScore as top-level JSON fields, your response will be considered invalid.
- The markdown report must follow the detailed structure above with comprehensive analysis.
- Include specific code examples and actionable recommendations.
- Do NOT include any text outside the JSON object.
- If you must include newlines in the report, use \n.

## Code
${files}

## Test Results
${JSON.stringify(testResult, null, 2)}

## Rubric
${rubric ? JSON.stringify(rubric, null, 2) : 'Default grading criteria'}

## NPM Registry Data
${npmRegistryData ? JSON.stringify(npmRegistryData, null, 2) : '{}'}

## Output Format
{ "codeQualityScore": number, "testScore": number, "report": "..." }
`;
}

function safeJsonParse(content: string): any {
  try {
    return JSON.parse(content);
  } catch {}
  const match = content.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  return {};
} 
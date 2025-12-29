const { execSync } = require('child_process');

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce specific commit types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, missing semicolons)
        'refactor', // Code restructuring without changing behavior
        'test', // Adding/modifying tests
        'chore', // Maintenance tasks (build, deps)
        'perf', // Performance improvements
        'build', // Changes affecting build system
        'ci', // CI/CD pipeline changes
        'revert', // Reverting changes
      ],
    ],
    // Ensure subject starts with an uppercase letter (Sentence Case)
    'subject-case': [2, 'always', 'sentence-case'],
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)(?:\((.+)\))?!?: (.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  // Custom branch name validation
  plugins: [
    {
      rules: {
        'branch-name': async () => {
          try {
            const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
            const branchRegex = /^(main|staging|develop)$|^(feat|fix|docs|chore)\/[a-z]+[a-zA-Z0-9-]*$/;

            return [
              branchRegex.test(branchName),
              `❌ Invalid branch name: "${branchName}". Use:
            - "main", "staging", "develop" OR
            - "feat/fix/docs/chore/branch-name"
            Example: feat/add-user-auth`,
            ];
          } catch (error) {
            return [false, '❌ Failed to retrieve branch name'];
          }
        },
        'commit-message-format': ({ raw }) => {
          const regex = /^(feat|fix|docs|style|refactor|test|chore|perf|build|ci|revert): .+/;
          if (!regex.test(raw)) {
            return [
              false,
              '🚨 **Invalid commit message format!** 🚨\n' +
              '🔹 **Your commit message must follow this format:**\n\n' +
              '✅ **Examples of valid commit messages:**\n' +
              '   ➤ git commit -m "feat: Add user login functionality"\n' +
              '   ➤ git commit -m "fix: Resolve authentication bug"\n' +
              '   ➤ git commit -m "docs: Update API documentation"\n' +
              '   ➤ git commit -m "style: Format code according to ESLint"\n\n' +
              '❌ **Incorrect Example:**\n' +
              '   ➤ git commit -m "save changes" ❌ (Invalid!)\n\n' +
              '📌 **Allowed types:** feat, fix, docs, style, refactor, test, chore, perf, build, ci, revert'
            ];
          }
          return [true, ''];
        },
      },
    },
  ],
};

@echo off
echo Setting up global VSCode configuration for consistent formatting...

REM Create global VSCode settings directory if it doesn't exist
if not exist "%APPDATA%\Code\User" mkdir "%APPDATA%\Code\User"

REM Backup existing settings
if exist "%APPDATA%\Code\User\settings.json" (
    copy "%APPDATA%\Code\User\settings.json" "%APPDATA%\Code\User\settings.json.backup"
    echo Backed up existing settings to settings.json.backup
)

REM Create global settings.json with consistent formatting rules
(
echo {
echo   "editor.tabSize": 2,
echo   "editor.insertSpaces": true,
echo   "editor.detectIndentation": false,
echo   "editor.formatOnSave": true,
echo   "editor.formatOnPaste": true,
echo   "editor.formatOnType": true,
echo   "editor.defaultFormatter": "esbenp.prettier-vscode",
echo   "editor.codeActionsOnSave": {
echo     "source.fixAll.eslint": "explicit"
echo   },
echo   "prettier.tabWidth": 2,
echo   "prettier.useTabs": false,
echo   "prettier.singleQuote": false,
echo   "prettier.semi": true,
echo   "prettier.printWidth": 80,
echo   "prettier.requirePragma": false,
echo   "files.insertFinalNewline": true,
echo   "files.trimTrailingWhitespace": true,
echo   "[javascript]": {
echo     "editor.defaultFormatter": "esbenp.prettier-vscode",
echo     "editor.tabSize": 2,
echo     "editor.insertSpaces": true,
echo     "editor.detectIndentation": false
echo   },
echo   "[typescript]": {
echo     "editor.defaultFormatter": "esbenp.prettier-vscode",
echo     "editor.tabSize": 2,
echo     "editor.insertSpaces": true,
echo     "editor.detectIndentation": false
echo   },
echo   "[json]": {
echo     "editor.defaultFormatter": "esbenp.prettier-vscode",
echo     "editor.tabSize": 2,
echo     "editor.insertSpaces": true,
echo     "editor.detectIndentation": false
echo   },
echo   "[jsonc]": {
echo     "editor.defaultFormatter": "esbenp.prettier-vscode",
echo     "editor.tabSize": 2,
echo     "editor.insertSpaces": true,
echo     "editor.detectIndentation": false
echo   },
echo   "eslint.validate": ["javascript", "typescript", "json"],
echo   "eslint.format.enable": true,
echo   "eslint.codeAction.showDocumentation": {
echo     "enable": true
echo   }
echo }
) > "%APPDATA%\Code\User\settings.json"

echo Global VSCode settings configured successfully!
echo Restart VSCode to apply changes.
echo.
echo Configuration applied:
echo - 2-space indentation (no tabs)
echo - Format on save/paste/type
echo - ESLint auto-fix on save
echo - Double quotes
echo - 80 character line width
echo.
pause
@echo off
echo ============================================
echo   Firebase Deploy - Dungeons e Drogas
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando autenticacao...
firebase projects:list
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Voce nao esta autenticado no Firebase!
    echo Execute: firebase login
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Fazendo deploy das regras de seguranca...
firebase deploy --only firestore:rules,storage:rules

if %errorlevel% neq 0 (
    echo.
    echo ERRO ao fazer deploy das regras!
    pause
    exit /b 1
)

echo.
echo [3/3] Fazendo deploy dos indices do Firestore...
firebase deploy --only firestore:indexes

if %errorlevel% neq 0 (
    echo.
    echo AVISO: Erro ao fazer deploy dos indices (isso e normal na primeira vez)
)

echo.
echo ============================================
echo   Deploy concluido com sucesso!
echo ============================================
echo.
echo Acesse: https://console.firebase.google.com/project/dungeons-e-drogas
echo.
pause

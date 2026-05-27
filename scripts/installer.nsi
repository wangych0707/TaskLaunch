Unicode true
!include "MUI2.nsh"

!ifndef PRODUCT_VERSION
  !define PRODUCT_VERSION "0.2.1"
!endif

!ifndef APP_EXE
  !error "APP_EXE is required"
!endif

!ifndef OUT_FILE
  !define OUT_FILE "..\src-tauri\target\release\bundle\nsis\TaskLaunch_0.2.1_x64-setup.exe"
!endif

!define PRODUCT_NAME "TaskLaunch"
!define PRODUCT_PUBLISHER "TaskLaunch"
!define PRODUCT_EXE "tasklaunch.exe"
!define REG_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\TaskLaunch"

Name "${PRODUCT_NAME}"
OutFile "${OUT_FILE}"
InstallDir "$LOCALAPPDATA\Programs\TaskLaunch"
InstallDirRegKey HKCU "${REG_KEY}" "InstallLocation"
RequestExecutionLevel user
ShowInstDetails show
ShowUninstDetails show

!define MUI_ABORTWARNING
!define MUI_ICON "..\src-tauri\icons\icon.ico"
!define MUI_UNICON "..\src-tauri\icons\icon.ico"
!define MUI_FINISHPAGE_RUN "$INSTDIR\${PRODUCT_EXE}"
!define MUI_FINISHPAGE_RUN_TEXT "Launch TaskLaunch"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "SimpChinese"

Section "TaskLaunch" SecMain
  SetOutPath "$INSTDIR"

  DetailPrint "Stopping running TaskLaunch..."
  nsExec::ExecToLog 'taskkill /IM tasklaunch.exe /F'

  File "/oname=${PRODUCT_EXE}" "${APP_EXE}"
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  CreateDirectory "$SMPROGRAMS\TaskLaunch"
  CreateShortCut "$SMPROGRAMS\TaskLaunch\TaskLaunch.lnk" "$INSTDIR\${PRODUCT_EXE}" "" "$INSTDIR\${PRODUCT_EXE}" 0
  CreateShortCut "$SMPROGRAMS\TaskLaunch\Uninstall TaskLaunch.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortCut "$DESKTOP\TaskLaunch.lnk" "$INSTDIR\${PRODUCT_EXE}" "" "$INSTDIR\${PRODUCT_EXE}" 0

  WriteRegStr HKCU "${REG_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "${REG_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKCU "${REG_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegStr HKCU "${REG_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${REG_KEY}" "DisplayIcon" "$INSTDIR\${PRODUCT_EXE}"
  WriteRegStr HKCU "${REG_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegDWORD HKCU "${REG_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "${REG_KEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  DetailPrint "Stopping running TaskLaunch..."
  nsExec::ExecToLog 'taskkill /IM tasklaunch.exe /F'

  Delete "$DESKTOP\TaskLaunch.lnk"
  Delete "$SMPROGRAMS\TaskLaunch\TaskLaunch.lnk"
  Delete "$SMPROGRAMS\TaskLaunch\Uninstall TaskLaunch.lnk"
  RMDir "$SMPROGRAMS\TaskLaunch"

  Delete "$INSTDIR\${PRODUCT_EXE}"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"

  DeleteRegKey HKCU "${REG_KEY}"
SectionEnd

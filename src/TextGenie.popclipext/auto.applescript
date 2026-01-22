-- auto.applescript for TextGenie
-- Top-level script handles fallback with cleaning and no-auto-run

set rawText to "{popclip text}"
set cleanedCmd to do shell script "echo " & quoted form of rawText & " | sed -E 's/^[[:space:]$#>%]+//'"
set useNewTab to "{popclip option useNewTab}" is "1"

try
    -- Quick check for iTerm2
    tell application "Finder" to get application file id "com.googlecode.iterm2"
    
    -- Option 1: iTerm2
    tell application id "com.googlecode.iterm2"
        activate
        delay 0.5
        if (count windows) is 0 then
            create window with default profile
            delay 1.0
        else if useNewTab then
            tell current window to create tab with default profile
            delay 0.8
        end if
        tell current session of current window to write text cleanedCmd newline false
    end tell
    
on error
    -- Option 2: Fallback Terminal
    tell application "Terminal"
        activate
        delay 0.5
        if (count windows) is 0 then
            do script ""
            delay 1.0
        else if useNewTab then
            tell application "System Events" to keystroke "t" using command down
            delay 0.8
        end if
        
        set the clipboard to cleanedCmd
        delay 0.3
        tell application "System Events"
            set frontmost of process "Terminal" to true
            keystroke "v" using command down
        end tell
    end tell
end try

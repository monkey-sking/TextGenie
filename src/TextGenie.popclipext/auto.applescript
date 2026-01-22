-- auto.applescript for TextGenie
-- Hybrid optimized logic combining native iTerm2 and fast-paste Terminal

set rawText to "{popclip text}"
set cleanedCmd to do shell script "echo " & quoted form of rawText & " | sed -E 's/^[[:space:]$#>%]+//'"
set useNewTab to "{popclip option useNewTab}" is "1"

try
    -- Check for iTerm2
    tell application "Finder" to get application file id "com.googlecode.iterm2"
    
    tell application id "com.googlecode.iterm2"
        activate
        if (count windows) is 0 then
            create window with default profile
            delay 0.3
        else if useNewTab then
            tell current window to create tab with default profile
            delay 0.2
        end if
        tell current session of current window to write text cleanedCmd newline false
    end tell
    
on error
    -- Fallback Terminal
    tell application "Terminal"
        activate
        if (count windows) is 0 then
            do script ""
            delay 0.3
        else if useNewTab then
            tell application "System Events" to keystroke "t" using command down
            delay 0.2
        end if
        
        set the clipboard to cleanedCmd
        delay 0.05
        tell application "System Events"
            set frontmost of process "Terminal" to true
            keystroke "v" using command down
        end tell
    end tell
end try

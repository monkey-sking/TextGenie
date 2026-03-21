-- iterm2.applescript for TextGenie
-- Optimized using official iTerm2 native command for instant filling without auto-run

set rawText to "{popclip text}"
-- Clean the text: strip leading whitespace and prompt symbols ($, #, >, %)
set cleanedCmd to do shell script ("/bin/echo " & quoted form of rawText & " | /usr/bin/sed -E 's/^[[:space:]$#>%]+//'")

try
    with timeout of 5 seconds
        tell application id "com.googlecode.iterm2"
            activate
            
            if (count windows) is 0 then
                create window with default profile
                delay 0.2
            else if "{popclip option useNewTab}" is "1" then
                tell current window
                    create tab with default profile
                end tell
                delay 0.15
            end if
            
            tell current session of current window
                write text cleanedCmd newline false
            end tell
        end tell
    end timeout
on error errMsg number errNum
    display notification "Could not fill iTerm2: " & errMsg with title "TextGenie"
end try

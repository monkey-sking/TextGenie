-- path.applescript for TextGenie
-- Robust version with proper ~ expansion and case-insensitive auto-correction

set rawPath to "{popclip text}"
set appPref to "{popclip option preferredFileManager}"

-- 1. Get Environment Info
-- Use native AppleScript to get the home path to avoid shell expansion issues
set homePath to do shell script "printf %s \"$HOME/\""
set sysUser to do shell script "whoami"

-- 2. Smart Auto-Correction & Placeholder Substitution
set correctedPath to rawPath

-- Replace %user% with actual username
if correctedPath contains "%user%" then
    -- Using python-style replace via sed for simple substitution
    set correctedPath to do shell script ("/bin/echo " & quoted form of correctedPath & " | /usr/bin/sed 's/%user%/" & sysUser & "/g'")
end if

-- PRE-CORRECTION LOGIC (Case-insensitive check)
set lowerPath to do shell script ("/bin/echo " & quoted form of correctedPath & " | /usr/bin/tr '[:upper:]' '[:lower:]'")

if (lowerPath starts with "users/") or (lowerPath starts with "applications/") or (lowerPath starts with "volumes/") then
    if not (correctedPath starts with "/") then
        set correctedPath to "/" & correctedPath
    end if
else if (lowerPath starts with "desktop/") or (lowerPath starts with "downloads/") or (lowerPath starts with "documents/") or ¬
    (lowerPath starts with "library/") or (lowerPath starts with "pictures/") or (lowerPath starts with "movies/") or ¬
    (lowerPath starts with "music/") then
    if not (correctedPath starts with "~/") then
        set correctedPath to "~/" & correctedPath
    end if
else if (correctedPath starts with sysUser & "/") then
    -- Handle case like 'username/Documents'
    set correctedPath to "/Users/" & correctedPath
end if

-- 3. Resolve Path
set resolvedPath to correctedPath
if correctedPath starts with "~/" then
    -- Manually replace ~/ with homePath
    set resolvedPath to homePath & (characters 3 thru -1 of correctedPath as string)
end if

-- Final cleanup of double slashes and expansion
set resolvedPath to do shell script ("/bin/echo " & quoted form of resolvedPath & " | /usr/bin/sed -E 's|/{2,}|/|g'")

-- 4. Verify & Open
set pathKind to "missing"
if resolvedPath starts with "/Volumes/" then
    set pathKind to "unknown"
else
    try
        set pathKind to do shell script ("if [ -d " & quoted form of resolvedPath & " ]; then echo dir; elif [ -e " & quoted form of resolvedPath & " ]; then echo file; else echo missing; fi")
    on error
        set pathKind to "missing"
    end try
end if

try
    if appPref is "finder" then
        if pathKind is "dir" then
            do shell script ("/usr/bin/open " & quoted form of resolvedPath)
        else if pathKind is "file" then
            do shell script ("/usr/bin/open -R " & quoted form of resolvedPath)
        else
            do shell script ("/usr/bin/open " & quoted form of resolvedPath)
        end if
    else
        set appName to ""
        if appPref is "pathfinder" then
            set appName to "Path Finder"
        else if appPref is "forklift" then
            set appName to "ForkLift"
        else if appPref is "qspace" then
            set appName to "QSpace"
        else if appPref is "commanderone" then
            set appName to "Commander One"
        else if appPref is "marta" then
            set appName to "Marta"
        end if
        
        if appName is not "" then
            do shell script ("/usr/bin/open -a " & quoted form of appName & " " & quoted form of resolvedPath)
        else
            do shell script ("/usr/bin/open " & quoted form of resolvedPath)
        end if
    end if
on error errMsg number errNum
    display notification "Could not open path: " & resolvedPath with title "TextGenie"
end try

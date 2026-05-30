-- path.applescript for TextGenie
-- Keep the action responsive by avoiding slow synchronous shell checks.

set rawPath to "{popclip text}"
set appPref to "{popclip option preferredFileManager}"
set homePath to POSIX path of (path to home folder)
set sysUser to short user name of (system info)

set correctedPath to my replaceText("%user%", sysUser, rawPath)

ignoring case
    if (correctedPath starts with "users/") or (correctedPath starts with "applications/") or (correctedPath starts with "volumes/") then
        if not (correctedPath starts with "/") then
            set correctedPath to "/" & correctedPath
        end if
    else if (correctedPath starts with "desktop/") or (correctedPath starts with "downloads/") or (correctedPath starts with "documents/") or ¬
        (correctedPath starts with "library/") or (correctedPath starts with "pictures/") or (correctedPath starts with "movies/") or ¬
        (correctedPath starts with "music/") then
        if not (correctedPath starts with "~/") then
            set correctedPath to "~/" & correctedPath
        end if
    else if (correctedPath starts with sysUser & "/") then
        set correctedPath to "/Users/" & correctedPath
    end if
end ignoring

set resolvedPath to correctedPath
if correctedPath starts with "~/" then
    set resolvedPath to homePath & (text 3 thru -1 of correctedPath)
end if

set resolvedPath to my collapseDoubleSlashes(resolvedPath)

try
    if appPref is "finder" then
        set openCommand to my finderOpenCommand(resolvedPath)
    else
        set appName to my fileManagerAppName(appPref)
        if appName is not "" then
            set openCommand to "/usr/bin/open -a " & quoted form of appName & space & quoted form of resolvedPath
        else
            set openCommand to "/usr/bin/open " & quoted form of resolvedPath
        end if
    end if
    
    do shell script "/bin/sh -c " & quoted form of ("(" & openCommand & ") >/dev/null 2>&1 &")
on error
    display notification "Could not open path: " & resolvedPath with title "TextGenie"
end try

on finderOpenCommand(resolvedPath)
    if resolvedPath starts with "/Volumes/" then
        return "/usr/bin/open " & quoted form of resolvedPath
    end if
    
    try
        set itemInfo to info for POSIX file resolvedPath
        if folder of itemInfo then
            return "/usr/bin/open " & quoted form of resolvedPath
        else
            return "/usr/bin/open -R " & quoted form of resolvedPath
        end if
    on error
        return "/usr/bin/open " & quoted form of resolvedPath
    end try
end finderOpenCommand

on fileManagerAppName(appPref)
    if appPref is "pathfinder" then
        return "Path Finder"
    else if appPref is "forklift" then
        return "ForkLift"
    else if appPref is "qspace" then
        return "QSpace"
    else if appPref is "commanderone" then
        return "Commander One"
    else if appPref is "marta" then
        return "Marta"
    end if
    
    return ""
end fileManagerAppName

on replaceText(findText, replacementText, sourceText)
    if sourceText does not contain findText then
        return sourceText
    end if
    
    set previousDelimiters to AppleScript's text item delimiters
    set AppleScript's text item delimiters to findText
    set textItems to text items of sourceText
    set AppleScript's text item delimiters to replacementText
    set replacedText to textItems as text
    set AppleScript's text item delimiters to previousDelimiters
    
    return replacedText
end replaceText

on collapseDoubleSlashes(pathText)
    set normalizedPath to pathText
    
    repeat while normalizedPath contains "//"
        set normalizedPath to my replaceText("//", "/", normalizedPath)
    end repeat
    
    return normalizedPath
end collapseDoubleSlashes

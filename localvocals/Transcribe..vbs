On Error Resume Next

Set objShell = WScript.CreateObject("WScript.Shell")

sFolder = "D:\OneDrive\Projects\Weather Channel Emulator\Local Vocal\"

transFile = sFolder & "Transcription.txt"
errFile = sFolder & "TranscriptionErrors.txt"

Set fso = CreateObject("Scripting.FileSystemObject")
'Set TFile = fso.CreateTextFile(transFile, True)
Set EFile = fso.CreateTextFile(errFile, True)
Set folder = fso.GetFolder(sFolder)
Set files = folder.Files

fso.DeleteFile transFile
  
For each folderIdx In files

	fileName = folderIdx.Name

	If Right(fileName, 4) = ".mp3" Then

	  	wavFile = ConvertToWav(fileName)
	  	
	  	If wavFile<>"" Then
	  	
	  		Call objShell.Run("cmd /c <nul set /p dummy=" & fileName & ",>>""" & transFile & """", 0, True)
	  	
	  		'TFile.Write fileName & vbTab
	  		'TFile.Close
	  		
	  		If TranscribeWav(wavFile) Then	
	  			' return value other than zero is error 		
		    	EFile.WriteLine(fileName & ": transcription error")
		    End If
		    
		    ' re-open the output file
		    'TFile = fso.OpenTextFile(transFile, ForAppend, False)
		    
			'TFile.Write vbCrLf
			'Call objShell.Run("cmd /c echo ," & fileName & " >>""" & transFile & """", 0, True)

		    
		Else	
			EFile.WriteLine(fileName & ": WAV conversion error")
		End If
				    
	 End If	 
    
Next
'TFile.Close
EFile.Close
  


' convert the mp3 To wav
Function ConvertToWav(fname)
	sox = """C:\Program Files\sox-14.4.2\sox.exe"" """
	
	wavFile = sFolder & "waves\" & fname & ".wav"
	ConvertToWav = wavFile
	
	If fso.FileExists(wavFile) Then
		Exit Function
	End If
	
	cmd = sox & sFolder & fname & """ -c 1 -r 16000 """ & wavFile & """"
	
	strErrorCode = objShell.Run(cmd, 0, True)

	
	If strErrorCode = 0 Then
		ConvertToWav = wavFile
	End If
	
End Function




' transcribe the wav
Function TranscribeWav(fname)
	cmd = """C:\Program Files\pocketsphinx\transcribe.cmd"" "
	
	srcFile = """" & fname & """"
	tgtFile = """" & transFile & """"
	
	cmd = cmd & srcFile & " " & tgtFile
	
	strErrorCode = objShell.Run(cmd, 0, True)
	
	TranscribeWav = strErrorCode

End Function

cd "D:\OneDrive\Projects\Weather Channel Emulator\Local Vocal\pocketsphinx"


pocketsphinx_continuous.exe -infile converted\%1.wav -hmm model\en-us\en-us -lm model\en-us\en-us.lm.bin -dict model\en-us\cmudict-en-us.dict 1>goodstuff.txt 2>badstuff.txt


cd ..


pause
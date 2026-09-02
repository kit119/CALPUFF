@echo off
rem 210375.8214759744,266964.2774968528,1585928.9624966767,1618452.7400550682 [EPSG:32651]
rem 225000.0,250000.0,1590000.0,1615000.000 [EPSG:32651]
rem utm: 32647 32651
rem mtp: 722 1395
rem limay: 225 1590


set path=%path%;%cd%\exe

rem echo ===== TH-WEST =====
rem ctgproc.exe inp\west\ctgproc.inp.west
rem terrel.exe inp\west\terrel.inp.west
rem makegeo.exe inp\west\makegeo.inp.west
rem copy data\UP.DAT .
rem copy data\SURF.DAT .
rem calmet.exe inp\west\calmet.inp.west
rem calpuff.exe inp\west\calpuff.inp.west
rem calpost.exe inp\west\calpost.inp.west

rem echo ===== MTP-OBS =====
rem ctgproc.exe inp\mtp\ctgproc.inp.mtp
rem terrel.exe inp\mtp\terrel.inp.mtp
rem makegeo.exe inp\mtp\makegeo.inp.mtp
rem copy data\UP.DAT .
rem copy data\SURF.DAT .
rem calmet.exe inp\mtp\calmet.inp.mtp
rem prtmet.exe inp\mtp\prtmet.inp.mtp
rem calpuff.exe inp\mtp\calpuff.inp.mtp
rem calpost.exe inp\mtp\calpost.inp.mtp

rem echo ===== MTP-MM5 =====
rem ctgproc.exe inp\mtp\ctgproc.inp.mtp
rem terrel.exe inp\mtp\terrel.inp.mtp
rem makegeo.exe inp\mtp\makegeo.inp.mtp
rem copy data\MM5THAI.DAT .
rem calmet.exe inp\mtp\calmet.inp.mtp.mm5
rem prtmet.exe inp\mtp\prtmet.inp.mtp.mm5
rem calpuff.exe inp\mtp\calpuff.inp.mtp.mm5
rem calpost.exe inp\mtp\calpost.inp.mtp

rem echo ===== LIMAY =====
rem ctgproc.exe inp\ctgproc.inp.limay
rem terrel.exe inp\terrel.inp.limay
rem makegeo.exe inp\makegeo.inp.limay
rem copy data\UP.DAT .
rem copy data\SURF.DAT .
rem calmet.exe inp\calmet.inp.limay
rem prtmet.exe inp\prtmet.inp.limay

pause

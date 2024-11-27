echo

cls

REM --------------- prepare design spec files --------------------
REM --------------- split PDF and move files --------------------

cd /d %~dp0
cd ..\docs\design-spec\source\_images

pdfseparate docPictures_2S.pdf %%d.pdf

ren 1.pdf view-3d-pcb-isometric-bottom.pdf
ren 2.pdf view-3d-pcb-isometric-top.pdf
ren 3.pdf view-3d-pcb-realistic-bottom.pdf
ren 4.pdf view-3d-pcb-realistic-top.pdf
ren 5.pdf board-assembly-drawing-bottom.pdf
ren 6.pdf board-assembly-drawing-top.pdf
ren 7.pdf board-positions-bottom.pdf
ren 8.pdf board-positions-top.pdf
ren 9.pdf board-layout-empty-bottom.pdf
ren 10.pdf board-layout-empty-top.pdf
ren 11.pdf board-layout-bottom.pdf
ren 12.pdf board-layout-top.pdf
ren 13.pdf board-mechanical-drawing-bottom.pdf
ren 14.pdf board-mechanical-drawing-top.pdf
ren 15.pdf board-pcb-spec.pdf
ren 16.pdf board-testpoints.pdf

move /Y view-3d-pcb-isometric-bottom.pdf ..\pcb
move /Y view-3d-pcb-isometric-top.pdf ..\pcb
move /Y view-3d-pcb-realistic-bottom.pdf ..\pcb
move /Y view-3d-pcb-realistic-top.pdf ..\pcb
move /Y board-assembly-drawing-bottom.pdf ..\hardware-layout
move /Y board-assembly-drawing-top.pdf ..\hardware-layout
move /Y board-positions-bottom.pdf ..\hardware-layout
move /Y board-positions-top.pdf ..\hardware-layout
move /Y board-layout-empty-bottom.pdf ..\hardware-layout
move /Y board-layout-empty-top.pdf ..\hardware-layout
move /Y board-layout-bottom.pdf ..\hardware-layout
move /Y board-layout-top.pdf ..\hardware-layout
move /Y board-mechanical-drawing-bottom.pdf ..\hardware-layout
move /Y board-mechanical-drawing-top.pdf ..\hardware-layout
move /Y board-pcb-spec.pdf ..\hardware-layout
move /Y board-testpoints.pdf ..\hardware-layout


REM --------------- generate png out of PDF --------------------

cd /d %~dp0
cd ..\docs\design-spec\source\hardware-layout
del board-positions-bottom.png
del board-positions-top.png
del board-pcb-spec.png
del board-mechanical-drawing-bottom.png
del board-mechanical-drawing-top.png
del board-layout-empty-bottom.png
del board-layout-empty-top.png
del board-layout-bottom.png
del board-layout-top.png
del board-assembly-drawing-bottom.png
del board-assembly-drawing-top.png
del board-testpoints.png

pdftocairo -r 600 -png -singlefile board-positions-bottom.pdf
pdftocairo -r 600 -png -singlefile board-positions-top.pdf
pdftocairo -r 600 -png -singlefile board-pcb-spec.pdf
pdftocairo -r 600 -png -singlefile board-mechanical-drawing-bottom.pdf
pdftocairo -r 600 -png -singlefile board-mechanical-drawing-top.pdf
pdftocairo -png -singlefile board-layout-empty-bottom.pdf
pdftocairo -png -singlefile board-layout-empty-top.pdf
pdftocairo -png -singlefile board-layout-bottom.pdf
pdftocairo -png -singlefile board-layout-top.pdf
pdftocairo -r 600 -png -singlefile board-assembly-drawing-bottom.pdf
pdftocairo -r 600 -png -singlefile board-assembly-drawing-top.pdf
pdftocairo -r 600 -png -singlefile board-testpoints.pdf

cd /d %~dp0
cd ..\docs\design-spec\source\pcb
del view-3d-pcb-realistic-top.png
del view-3d-pcb-realistic-bottom.png
del view-3d-pcb-isometric-top.png
del view-3d-pcb-isometric-bottom.png

pdftocairo -png -singlefile view-3d-pcb-realistic-top.pdf
pdftocairo -png -singlefile view-3d-pcb-realistic-bottom.pdf
pdftocairo -r 600 -png -singlefile view-3d-pcb-isometric-top.pdf
pdftocairo -r 600 -png -singlefile view-3d-pcb-isometric-bottom.pdf

REM --------------- copy files to startup-proc folder --------------------

copy /Y view-3d-pcb-realistic-top.png ..\..\..\startup-procedure\source\device-under-test\view-3d-pcb-realistic-top.png
copy /Y view-3d-pcb-realistic-bottom.png ..\..\..\startup-procedure\source\device-under-test\view-3d-pcb-realistic-bottom.png

REM --------------- back to root -----------------
cd /d %~dp0
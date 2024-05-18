//
//  plot: simple plotter on JavaScript
//
//  by Hideki Kozima (xkozima@nict.go.jp)
//  June 11, 2006

var  PW, PH, PL, PB;
var  LineColor = "#000000";
var  Px0, Py0;
var  CanDiv;

function glinestyle (color)
{
    LineColor = color;
}

function gpoint (x, y)
{
    if ((x >= PL) && (x <= PL+PW) && (y >= PB) && (y <= PB+PH)) {
        var  ChildDiv;

        ChildDiv = document.createElement('div');
        ChildDiv.style.position = 'absolute';
        ChildDiv.style.left     = x + 'px';
        ChildDiv.style.bottom   = y + 'px';
        ChildDiv.style.width    = '1px';
        ChildDiv.style.height   = '1px';
        ChildDiv.style.backgroundColor = LineColor;
        ChildDiv.style.overflow = 'hidden';
        CanDiv.appendChild(ChildDiv);
    }
}

function ghline (x1, y1, x2)
{
    var  ChildDiv;

    if (x1 > x2) {
        var  tmp;
        tmp = x1; x1 = x2; x2 = tmp;
    }

    if (x1 < PL) x1 = PL;
    if (x2 > PL+PW) x2 = PL+PW;
    if (y1 < PB) y1 = PB; else if (y1 > PB+PH) y1 = PB+PH;

    ChildDiv = document.createElement('div');
    ChildDiv.style.position = 'absolute';
    ChildDiv.style.left     = x1 + 'px';
    ChildDiv.style.bottom   = y1 + 'px';
    ChildDiv.style.width    = (x2-x1) + 'px';
    ChildDiv.style.height   = '1px';
    ChildDiv.style.backgroundColor = LineColor;
    ChildDiv.style.overflow = 'hidden';
    CanDiv.appendChild(ChildDiv);
} 

function gvline (x1, y1, y2)
{
    var  ChildDiv;

    if (y1 > y2) {
        var  tmp;
        tmp = y1; y1 = y2; y2 = tmp;
    }

    if (x1 < PL) x1 = PL; else if (x1 > PL+PW) x1 = PL+PW;
    if (y1 < PB) y = PB;
    if (y2 > PB+PH) y = PB+PH;

    ChildDiv = document.createElement('div');
    ChildDiv.style.position = 'absolute';
    ChildDiv.style.left     = x1 + 'px';
    ChildDiv.style.bottom   = y1 + 'px';
    ChildDiv.style.width    = '1px';
    ChildDiv.style.height   = (y2-y1) + 'px';
    ChildDiv.style.backgroundColor = LineColor;
    ChildDiv.style.overflow = 'hidden';
    CanDiv.appendChild(ChildDiv);
} 

function gline (x1, y1, x2, y2)
{
    var  x, y, p;

    if (Math.abs(x1 - x2) >= Math.abs(y1 - y2)) {
        //  horizontal
        if (x1 <= x2) {
            for (x = x1; x <= x2; x++) {
                p = (x - x1) / (x2 - x1);
                y = y1 + p * (y2 - y1);
                gpoint(x, y);
            }
        }
        else {
            for (x = x2; x <= x1; x++) {
                p = (x - x1) / (x2 - x1);
                y = y1 + p * (y2 - y1);
                gpoint(x, y);
            }
        }
    }
    else {
        //  vertical
        if (y1 <= y2) {
            for (y = y1; y <= y2; y++) {
                p = (y - y1) / (y2 - y1);
                x = x1 + p * (x2 - x1);
                gpoint(x, y);
            }
        }
        else {
            for (y = y2; y <= y1; y++) {
                p = (y - y1) / (y2 - y1);
                x = x1 + p * (x2 - x1);
                gpoint(x, y);
            }
        }
    }
}

var TextSize  = 12;
var TextColor = "#ffffff";

function gtextstyle (size, color)
{
    TextSize  = size;
    TextColor = color;
}

function gtext (x, y, text)
{
    var  ChildDiv;

    ChildDiv = document.createElement('div');
    ChildDiv.style.position = 'absolute';
    ChildDiv.style.left     = x + 'px';
    ChildDiv.style.bottom   = y + 'px';
    ChildDiv.style.fontSize = TextSize + 'px';
    ChildDiv.style.color    = TextColor;
    ChildDiv.appendChild(document.createTextNode(text));
    CanDiv.appendChild(ChildDiv);
}

var  MinX, MaxX, MinY, MaxY;
var  NewFlag = true;

function X2x (X)
{
    return  PL + PW * (X - MinX) / (MaxX - MinX);
}

function Y2y (Y)
{
    return  PB + PH * (Y - MinY) / (MaxY - MinY);
}

function d2s (d)
{
    return (Math.round(d * 1000000) / 1000000) + '';
}

function gopen (id, minX, maxX, tickX, minY, maxY, tickY, 
                width, height, top, right, bottom, left )
{
    var  X, Y;
    var  i;

    CanDiv = document.getElementById(id);

    NewFlag = true;

    PW = width  - left - right;
    PH = height - top  - bottom;
    PL = left;
    PB = bottom;

    while (CanDiv.hasChildNodes()) {
        CanDiv.removeChild(CanDiv.lastChild);
    }

    MinX = minX;  MaxX = maxX;
    MinY = minY;  MaxY = maxY;
    
    gtextstyle(12, "#ffffff");
    glinestyle("#666666");
    for (X = minX; X <= maxX; X += tickX) {
        gtext(X2x(X)-3, bottom - 25, d2s(X));
        gvline(X2x(X), PB, PB+PH);
    }
    for (Y = minY; Y <= maxY; Y += tickY) {
        gtext(left - 30, Y2y(Y)-10, d2s(Y));
        ghline(PL, Y2y(Y), PL+PW);
    }

    glinestyle("#ff4444");
}

function gplot (X, Y)
{
    Px1 = X2x(X);  Py1 = Y2y(Y);

    if (NewFlag) {
        Px0 = Px1;
        Py0 = Py1;
        NewFlag = false;
    }

    gline(Px0, Py0, Px1, Py1);

    Px0 = Px1;
    Py0 = Py1;
}

function gclose ()
{
}

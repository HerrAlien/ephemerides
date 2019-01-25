/* ephemeris - a software astronomical almanach 

Copyright 2017 Herr_Alien <alexandru.garofide@gmail.com>

This program is free software: you can redistribute it and/or modify it under 
the terms of the GNU Affero General Public License as published by the 
Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY 
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see <https://www.gnu.org/licenses/agpl.html>. */

(function(){
var sourceMenu = $get("navigation");
var oldScrollTop = 0;
    
window.addEventListener("scroll", function() {
    var scrolledTop = document.body.scrollTop || (document.body.getBoundingClientRect().y * -1);
    var scrolled = scrolledTop >= 20;
    var pageObj = false;
    if (previousPage) {
        pageObj = Pages [previousPage.id];
        if (pageObj && pageObj.hostElement && pageObj.hostElement['rows'] && pageObj.hostElement['rows'][1]) {
            if (scrolled) {
                // get the first two rows
                pageObj.hostElement.rows[0].classList.remove ("firstHeaderRow");
                pageObj.hostElement.rows[0].classList.add ("firstHeaderRowScrolled");

                pageObj.hostElement.rows[1].classList.remove ("secondHeaderRow");
                pageObj.hostElement.rows[1].classList.add ("secondHeaderRowScrolled");
            } else {
                pageObj.hostElement.rows[0].classList.add ("firstHeaderRow");
                pageObj.hostElement.rows[0].classList.remove ("firstHeaderRowScrolled");

                pageObj.hostElement.rows[1].classList.add ("secondHeaderRow");
                pageObj.hostElement.rows[1].classList.remove ("secondHeaderRowScrolled");                    
            }
        }            
    }
    
    if (scrolled) {
        sourceMenu.classList.add ("withDropShadow");
    } else {
        sourceMenu.classList.remove ("withDropShadow");
    }
    
    var hysterezis = 15;
    // is it on a small screen?
if (pageObj && pageObj.hostElement && pageObj.hostElement['rows'] && pageObj.hostElement['rows'][1]) {    if (scrolledTop > oldScrollTop + hysterezis && scrolledTop > 180 ) {
        // scrolled down
        sourceMenu.classList.add ("movedMenu");
        if (pageObj && pageObj.hostElement && pageObj.hostElement['rows']) {
            pageObj.hostElement.rows[0].classList.add ("movedMenu");
            pageObj.hostElement.rows[1].classList.add ("movedMenu");
        }
    } else if (scrolledTop < oldScrollTop - hysterezis || scrolledTop < 180) {
    // scrolled up
        sourceMenu.classList.remove ("movedMenu");
        if (pageObj && pageObj.hostElement && pageObj.hostElement['rows']) {
            pageObj.hostElement.rows[0].classList.remove ("movedMenu");
            pageObj.hostElement.rows[1].classList.remove ("movedMenu");
        }
    }
    
    oldScrollTop = scrolledTop;
}
});

$get("showNavigationMenu").onclick = function () {
    var pageObj = Pages [previousPage.id];
    sourceMenu.classList.remove ("movedMenu");
    if (pageObj && pageObj.hostElement && pageObj.hostElement['rows']) {
        pageObj.hostElement.rows[0].classList.remove ("movedMenu");
        pageObj.hostElement.rows[1].classList.remove ("movedMenu");
    }
}
})();
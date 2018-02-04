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

var PageRank = {
    // returns an array of page names, in order of likelyhood of being the
    // result the user expected.
    rank : function (searchTerms) {
        var rankedPages = [];
        var pagesAray = [];
        for (key in Pages) {
            if (!Pages[key]['PageRankKeywords']) {
                Pages[key]['PageRankKeywords'] = PageRank.getPageKeywords(key);
            }
            pagesAray.push({name : key, 
                            rank: PageRank.computeRank(searchTerms, Pages[key]['PageRankKeywords'])});
        }
        pagesAray.sort(function(entryA, entryB){ 
            return entryB.rank - entryA.rank; 
        });
        for (var i = 0; i < pagesAray.length; i++) {
            if (pagesAray[i].rank > 0) {
                rankedPages.push(pagesAray[i].name);
            }
        }
        return rankedPages;
    },
    getPageKeywords : function (pageName) {
        var keywords = [pageName];
        var titleArr = pageName.split(" ");
        for (var i = 0; i < titleArr.length; i++) {
            keywords.push(titleArr[i].toUpperCase());
        }
        var page = Pages[pageName];
        for (var key in page) {
            keywords.push (key.toUpperCase());
            var obj = page[key];
            if (obj) {
                if (typeof obj == "function") {
                    continue;
                }
                keywords.push(JSON.stringify(obj).toUpperCase());
            }
        }

        return keywords;
    },

    arrayContainsSubstring : function (term, arr) {
      for (var i = 0; i < arr.length; i++) {
          if (arr[i].indexOf(term) >= 0) {
              return true;
          }
      }
      return false;  
    },

    computeRank : function (searchTerms, keywords) {
        var rank = 0;
        var caseInsensitiveSearchTerms = [];
        for (var i = 0; i < searchTerms.length; i++) {
            caseInsensitiveSearchTerms.push(searchTerms[i].toUpperCase());
        }
        for (var i = 0; i < caseInsensitiveSearchTerms.length; i++) {
            if (PageRank.arrayContainsSubstring(caseInsensitiveSearchTerms[i], keywords)) {
                rank++;
            }
        }
        for (var i = 0; i < keywords.length; i++) {
            if (PageRank.arrayContainsSubstring(keywords[i], caseInsensitiveSearchTerms)) {
                rank += 0.25;
            }
        }
        return rank;
    }
};
window.onload = (event) => { 
    // Alleen Nederlandse pagina's
    if((document.getElementsByTagName('html')[0].hasAttribute('lang') && document.getElementsByTagName('html')[0].getAttribute('lang').toLowerCase() == 'nl')
        || (document.getElementsByTagName('html')[0].hasAttribute('xml:lang') && document.getElementsByTagName('html')[0].getAttribute('xml:lang').toLowerCase() == 'nl')){
        
    
        dictionary = {};
        dictionary_find = [];
        already_checked = [];
        fetch(chrome.runtime.getURL('Uitsluitingen.txt'))
            .then(response => response.text())
            .then((data) => {
                exclusions = data.split(/\r?\n/);
            
            fetch(chrome.runtime.getURL('Woordenlijst.txt'))
                .then(response => response.text())
                .then((data) => {
                    data.split(/\r?\n/).forEach((word) => {
                        word = word.split('>');
                        if(exclusions.includes(word[0]) === false){
                            dictionary[word[0]] = [...new Set(word.splice(1))]
                        }
                    });
                    dictionary_find = Object.keys(dictionary);

                    var walker = document.createTreeWalker(
                        document.body, 
                        NodeFilter.SHOW_TEXT, 
                        null, 
                        false
                    );

                    var node;
                    while(node = walker.nextNode()) {
                        try{
                            node.nodeValue.match(/[A-Za-z-\u00C0-\u017F]+/g).forEach((word) => {
                                word_lc = word.toLowerCase();
                                if (['style','script'].includes(node.parentElement.tagName.toLowerCase())){
                                    //console.log("Skipping inline element: " + node.parentElement.tagName);
                                }
                                else if (already_checked.includes(word_lc)){
                                    //console.log("Already checked: " + word_lc);
                                }
                                else if (dictionary_find.includes(word_lc)){
                                    //console.log("Found in dictionary: " + word_lc);
                                    node_parts = node.nodeValue.split(word,2);
                                    if(node_parts.length == 2){
                                        //console.log(node_parts);
                                        node1 = document.createTextNode(node_parts[0]);
                                        node2 = document.createElement('moeilijk-woord');
                                        node2.textContent = word
                                        node2.title = node2.title + word_lc + ':' + String.fromCharCode(10) + '  ' + dictionary[word_lc].join(String.fromCharCode(10)+'  ');
                                        node2.style.textDecoration = 'underline dotted';
                                        node2.style.cursor = 'context-menu';
                                        node.nodeValue = node_parts[1];
                                        parent = node.parentElement
                                        parent.insertBefore(node1, node);
                                        parent.insertBefore(node2, node);
                                    }
                                    already_checked.push(word_lc);
                                }
                                else{
                                    //console.log("Did not find in dictionary: " + word_lc);
                                    already_checked.push(word_lc);
                                }
                            })
                        }
                        catch(error){
                            console.log(error);
                            console.log('Did not parse: ' + node.nodeValue)
                            continue;
                        }
                    }
                }) 
        })
    }
};

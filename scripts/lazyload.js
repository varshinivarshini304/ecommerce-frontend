(function(){
    'use strict';
    const supportsIntersection = 'IntersectionObserver' in window;
    const selector = 'img.lazy-img[data-src]';

    function loadImage(img){
        if(!img) return;
        const dataSrc = img.getAttribute('data-src');
        const dataSrcset = img.getAttribute('data-srcset');
        if(dataSrc){ img.src = dataSrc; }
        if(dataSrcset){ img.srcset = dataSrcset; }
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
        img.classList.remove('lazy-img');
    }

    function initObserver(){
        const io = new IntersectionObserver((entries)=>{
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    const img = entry.target;
                    loadImage(img);
                    io.unobserve(img);
                }
            });
        },{
            rootMargin: '200px 0px',
            threshold: 0.01
        });

        document.querySelectorAll(selector).forEach(img => io.observe(img));
    }

    function loadAll(){
        document.querySelectorAll(selector).forEach(img => loadImage(img));
    }

    function onDom(){
        if(supportsIntersection){
            initObserver();
        } else {
            loadAll();
        }
    }

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', onDom);
    } else {
        onDom();
    }
})();

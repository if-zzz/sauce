window.onload = function(){
    var outer_container = document.getElementById('container');
    var image_large_container = document.getElementById('photo_large');
    var image = document.getElementById('image'); 
    var image_large = document.getElementById('image_large');
    if(image){
        image.onclick = function(){
            outer_container.style.display = 'none';
            image_large_container.style.display = null;
            return false;
        };
        image_large.onclick = function(){
            outer_container.style.display = null;
            image_large_container.style.display = 'none';
            return false;
        };
    }
};
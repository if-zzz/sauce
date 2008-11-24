Cookie = {
    set: function(name,value,seconds){
        if(seconds){
            var d = new Date();
            d.setTime(d.getTime() + (seconds * 1000));
            var expiry = '; expires=' + d.toGMTString();
        }else
            var expiry = '';
        document.cookie = name + "=" + value + expiry + "; path=/";
    },
    get: function(name){
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++){
            var c = ca[i];
            while(c.charAt(0) == ' ')
                c = c.substring(1,c.length);
            if(c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length,c.length);
        }
        return null;
    },
    unset: function(name){
        Cookie.set(name,'',-1);
    }
};

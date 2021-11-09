$(function() {
    $(document).on('input', 'input[type="range"]', function(e) {
        let id = e.target.id;
        let val = e.target.value;
        //console.log(id+':'+val);
        $('output#'+id).html(val);
        mp.trigger('camCB', id, Number(val));
    });
    
    $('input[type=range]').rangeslider({
      polyfill: false,
    });
});

// function show(){
//     $('.control').css('display', 'block');
// }
// function hide(){
//     $('.control').css('display', 'none');
// }
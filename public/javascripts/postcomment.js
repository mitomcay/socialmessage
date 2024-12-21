$('document').ready( function() {
    setInterval(fetchcomment, 1000);
});

function fetchcomment(){
    const pathSegments = window.location.pathname.split('/');
    const postId = pathSegments[pathSegments.length - 1];
    //console.log(postId);

    $.ajax({
        url:'/comment/getcomment', 
        type:'POST',
        data: JSON.stringify({ postId }),
        contentType:'application/json',
        dataType:'json',
        success:function(data){
            console.log(data.comments);
            if(data.comments.length > 0){
                let a = '';
                data.comments.forEach( comment =>{
                    a += `<p>${comment.Author.username}: ${comment.content}</p> `;
                })
                $('#comment-container').html(a);
            }
            else{
                $('#comment-container').html('no comment');
            }
           
        },
        error:function(err){
            console.log(err);
        }
    });
}

$('#comment-form').on('submit', function(event){
    // Prevent the form from submitting the traditional way (page reload)
    event.preventDefault();

    const postId = $('#postid').val();
    const comment = $('#comment-input').val();

    // Ensure the comment is not empty before sending
    if(comment.trim() === '') {
        alert('Please enter a comment.');
        return;
    }

    $.ajax({
        url: '/comment', 
        type: 'POST',
        data: JSON.stringify({ postId, comment }),
        contentType: 'application/json',
        dataType: 'json',
        success: function(data) {
            //alert(data.message);  // Show the success message from the server
            $('#comment-input').val('');  // Clear the comment input field
            fetchComment();  // Fetch and display updated comments
        },
        error: function(err) {
            console.log('Error:', err);
            alert('Something went wrong. Please try again.');
        }
    });
});

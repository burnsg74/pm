<script>
    import Editor from '@tinymce/tinymce-svelte';

    let value = 'some content';
    let conf = {
        height: 500,
        menubar: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
    }
</script>


<div class="notes_container">
    <div class="notes_left-column">

    </div>
    <div class="notes_right-column">
        <h1>Notes</h1>
        <p>Here are some notes.</p>
        <div>{@html value}</div>
        <Editor
                licenseKey='gpl'
                scriptSrc='tinymce/tinymce.min.js'
                bind:value={value}
                {conf}
        />
    </div>
</div>
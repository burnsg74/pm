import styles from "./styles.module.css";
import React, {useRef} from 'react';
import {Editor} from '@tinymce/tinymce-react';
import 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';

const Editor = () => {
    const editorRef = useRef(null);

    const handleEditorChange = (content, editor) => {
        console.log('Content was updated:', content);
    };

    return (
        <Editor
            onInit={(evt, editor) => (editorRef.current = editor)}
            initialValue="<p>This is the initial content of the editor.</p>"
            init={{
                license_key: 'gpl', // Or your actual TinyMCE license key string
                menubar: true,
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; height:100vh; }',
                base_url: '/tinymce',
                height: '100vh',
                min_height: '100vh',
                resize: false,
            }}
            onEditorChange={handleEditorChange}
        />
    );
};

export default Editor;
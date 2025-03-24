import React, {useCallback} from "react";
import {useRef} from 'react';
import {Editor} from '@tinymce/tinymce-react';
import debounce from 'lodash/debounce';
import styles from "../Notes/Notes.module.css";

const Notes = () => {
    const editorRef = useRef(null);
    const [currentNote, setCurrentNote] = React.useState({
        id: 0,
        title: '',
        note: '',
        created_at: '',
        modified_at: '',
        viewed_at: ''
    });
    const debounceTimeout = useRef(null);

    const saveNoteToBackend = (id, content) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    };

    const debouncedSaveNote = useCallback(
        debounce((id, content) => {
            saveNoteToBackend(id, content);
        }, 3000),
        []
    );

    const updateNote = (noteContent) => {
        setCurrentNote((prev) => {
            if (prev) debouncedSaveNote(prev.id, noteContent);
            return prev ? { ...prev, note: noteContent } : { ...currentNote, note: noteContent };
        });
    };

    return (
        <div className={`${styles.container}`}>
            <div className={`${styles.leftCol}`}>
            </div>
            <div className={`${styles.rightCol}`}>
                <div className="mb-1">
                    <input
                        type="text"
                        className="form-control"
                        id="noteTitle"
                        placeholder="Title"
                        autoComplete="off"
                        value={currentNote?.title || ''}
                        onChange={(e) =>
                            setCurrentNote((prev) =>
                                prev ? { ...prev, title: e.target.value } : { ...currentNote, title: e.target.value }
                            )
                        }
                    />
                </div>
                <Editor
                    licenseKey="gpl"
                    tinymceScriptSrc="/node_modules/tinymce/tinymce.min.js"
                    onInit={(_evt, editor) => editorRef.current = editor}
                    value={currentNote.note}
                    init={{
                        height: "85vh",
                        menubar: false,
                        autosave_interval: '5s',
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'autosave'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help | link',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                    onEditorChange={(content) => {
                        updateNote(content);
                    }}
                />
            </div>
        </div>
    );
}

export default Notes;
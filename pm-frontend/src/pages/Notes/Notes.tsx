import React, {useCallback} from "react";
import {useRef} from 'react';
import {Editor} from '@tinymce/tinymce-react';
import debounce from 'lodash/debounce';
import styles from "../Notes/Notes.module.css";

export interface Notes {
    id: number;
    note: string;
    title: string;
    created_at: string;
    modified_at: string;
    viewed_at: string;
}

const Notes: React.FC = () => {
    const editorRef = useRef<import('tinymce').Editor | null>(null);
    const [currentNote, setCurrentNote] = React.useState<Notes>({
        id: 0,
        title: '',
        note: '',
        created_at: '',
        modified_at: '',
        viewed_at: ''
    });
    const debounceTimeout = useRef<number | null>(null);

    const saveNoteToBackend = (id: number, content: string) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    };

    const debouncedSaveNote = useCallback(
        debounce((id: number, content: string) => {
            saveNoteToBackend(id, content);
        }, 3000), // 3000ms = 3 seconds
        []
    );

    const updateNote = (noteContent: string) => {
        setCurrentNote((prev) => {
            // Call debounced save function whenever note is updated
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
                        // setCurrentNote((prev) =>
                        //     prev ? { ...prev, note: content } : { ...currentNote, note: content }
                        // );
                        //     saveNoteToBackend(currentNote.id, content);
                    }}
                />
            </div>
        </div>
    );
}

export default Notes;
import React, {useEffect, useState, useCallback} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {markdown} from '@codemirror/lang-markdown';
import {oneDark} from '@codemirror/theme-one-dark';
import {vim} from "@replit/codemirror-vim";
import styles from "./DocsHome.module.css";

const DocsHome = () => {
    const DB_URL = import.meta.env.VITE_DB_URL;
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [content, setContent] = useState('');
    const [debouncedContent, setDebouncedContent] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`${DB_URL}/api/docs`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setFiles(await response.json());
        };
        fetchData();
    }, []);

    const handleFileClick = async (fileName) => {
        setSelectedFile(fileName);
        const response = await fetch(`${DB_URL}/api/doc/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName })
        });

        if (response.ok) {
            const text = await response.text();
            setContent(text);
        } else {
            console.error("Failed to fetch file content");
        }
    };

    const saveContentToServer = useCallback(async (fileName, updatedContent) => {
        if (!fileName) return;
        try {
            const response = await fetch(`${DB_URL}/api/saveContent`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName, content: updatedContent }),
            });

            if (!response.ok) {
                console.error("Failed to save file content");
            }
        } catch (err) {
            console.error("Error saving file content:", err);
        }
    }, [DB_URL]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (debouncedContent) {
                saveContentToServer(selectedFile, debouncedContent).then(
                    () => setDebouncedContent("")
                );
            }
        }, 2000);

        return () => {
            clearTimeout(handler);
        };
    }, [debouncedContent, saveContentToServer]);

    return (
        <div className={`${styles.container}`}>
            <div className={`${styles.leftCol}`}>
                {files.map((file) => (
                    <div key={file}>
                        <div
                            onClick={() => handleFileClick(file)}
                            className={`${styles.fileItem}`}
                        >
                            {file}
                        </div>
                    </div>
                ))}
            </div>
            <div className={`${styles.rightCol}`}>
                <CodeMirror
                    value={content}
                    height="auto"
                    theme={oneDark}
                    extensions={[
                        vim(),
                        markdown()
                    ]}
                    onChange={(value) => {
                        setContent(value);
                        setDebouncedContent(value);
                    }}
                />
            </div>
        </div>
    );
};

export default DocsHome;
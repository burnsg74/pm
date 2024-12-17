import React, {useCallback, useState} from "react";
import {SimpleMdeReact} from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

const Editor: React.FC = () => {
  const [value, setValue] = useState("Initial value");
  const onChange = useCallback((value: string) => {
    setValue(value);
  }, []);
  return (
      <SimpleMdeReact value={value} onChange={onChange} />
  );
};

export default Editor;
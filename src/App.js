// Import React dependencies.
import React, { useCallback, useMemo, useState, useEffect } from "react";
// Import the Slate editor factory.
import { createEditor, Transforms } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'

import { convert } from './romanizedNepali'; 

const App = () => {
  const editor = useMemo(() => withReact(createEditor()), []);

  const { isVoid } = editor;

  editor.isVoid = element => {
    return element.type === 'readOnly' ? true : isVoid(element);
  };
  const [translations, setTranslations] = useState({});
  // Add the initial value when setting up our state.
  const [value, setValue] = useState([
    {
      paragraphRef: 1,
      type: 'readOnly',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
    {
      paragraphRef: 1,
      type: 'translation',
      children: [{ text: '' }],
    },
    {
      paragraphRef: 2,
      type: 'readOnly',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
    {
      paragraphRef: 2,
      type: 'translation',
      children: [{ text: '' }],
    },
  ]);

  useEffect(() => {
    const translatedValue = value.reduce((aggregate, textBlock) => {
      if (textBlock.type === 'translation') {
        return { ...aggregate, [textBlock.paragraphRef]: convertSentences(textBlock.children[0].text) };
      }
      return { ...aggregate };
    }, {});
    setTranslations(translatedValue);
  },[value])

  const convertSentences = sentence => {
    return sentence.split(" ").map(word => convert(word)).join(" ");
  }

  const renderElement = props => {
    switch (props.element.type) {
      case 'readOnly':
        return <ReadOnlyElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }; 

  const clickTranslationBtn = (ref, editor) => {
    const translatedValue =  translations[ref];
    console.log(translatedValue);
    // Transforms.delete(
    //   editor,
    //   { at: editor.selection, unit: 'line' }
    // );
    // Transforms.insertText(
    //   editor,
    //   translatedValue,
    //   { match: n => n.paragraphRef === ref && n.type === "translation" }
    // );
  };

  const DefaultElement = props => {
    return (
      <div>
        <p {...props.attributes}>{props.children}</p>
        <div style={{ position: 'relative', top: 10 }}>
          <p>
            &nbsp;{translations[props.element.paragraphRef]}
          </p>
          <button onClick={e => clickTranslationBtn(props.element.paragraphRef, editor)} type="button" style={translationMenu}>Use Translation</button>
        </div>
      </div>
    )
  }
  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
      <Editable 
        renderElement={renderElement}
      />
    </Slate>
  )
};


const ReadOnlyElement = props => {
  return (
    <div {...props.attributes} style={{ position: 'relative' }}>
      <p contentEditable={false}>{props.element.children[0].text}</p>{props.children}
    </div>
  )
}
export default App;

var translationMenu = {
  position: 'absolute',
  top: -25,
  left: 0,
};

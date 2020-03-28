// Import React dependencies.
import React, { useCallback, useMemo, useState, useEffect } from "react";
// Import the Slate editor factory.
import { Element, Editor, createEditor, Transforms } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'

import { convert } from './romanizedNepali'; 


const App = () => {
  const editor = useMemo(() => withReact(createEditor()), []);

  const { isVoid } = editor;

  editor.isVoid = element => {
    return element.void ? true : isVoid(element);
  };
  const [translations, setTranslations] = useState({});
  // Add the initial value when setting up our state.
  const [value, setValue] = useState([
    {
      paragraphRef: 1,
      type: 'readOnly',
      void: true,
      children: [{ text: 'A line of text in a paragraph.' }],
    },
    {
      paragraphRef: 1,
      type: 'translation',
      children: [{ text: '' }],
    },
    {
      paragraphRef: 1,
      type: 'translatedTextPreview',
      translatedText: '',
      void: true,
      children: [{ text: '' }],
    },
    {
      paragraphRef: 2,
      type: 'readOnly',
      void: true,
      children: [{ text: 'A line of text in a paragraph.' }],
    },
    {
      paragraphRef: 2,
      type: 'translation',
      children: [{ text: '' }],
    },
    {
      paragraphRef: 2,
      type: 'translatedTextPreview',
      void: true,
      translatedText: '',
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
      case 'translatedTextPreview':
        return <TranslatedText {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }; 


  const DefaultElement = props => {
    return (
      <div>
        <p {...props.attributes}>{props.children}</p>
      </div>
    )
  }
  return (
    <Slate 
      editor={editor} 
      value={value} 
      onChange={value => {
        const translations = value.filter(textBlock => textBlock.type === "translation");
        const changedValue = value.map(textBlock => {
          if(textBlock.type === "translatedTextPreview") {
            const text = translations.find(block => block.paragraphRef === textBlock.paragraphRef).children[0].text;
            return { ...textBlock, translatedText: convertSentences(text) };
          }
          return textBlock;
        });
        console.log(changedValue);
        setValue(changedValue);
      }}
    >
      <Editable 
        renderElement={renderElement}
      />
    </Slate>
  )
};


const ReadOnlyElement = props => {
  return (
    <div {...props.attributes} >
      <p contentEditable={false}>{props.element.children[0].text}</p>{props.children}
    </div>
  )
}

const TranslatedText = props => {
  return (
    <div {...props.attributes} >
      <p contentEditable={false}>{props.element.translatedText ? props.element.translatedText : ' '}</p>{props.children}
    </div>
  )
}

export default App;

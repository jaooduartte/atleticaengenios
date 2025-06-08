const React = require('react');
const { useEditor, EditorContent } = require('@tiptap/react');
const StarterKit = require('@tiptap/starter-kit').default;
const PropTypes = require('prop-types');

function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'w-full rounded-xl text-sm p-3 transition-colors focus:outline-none bg-gray-100 dark:bg-white/5 backdrop-blur-md text-black dark:text-white min-h-[160px] max-h-[320px] overflow-y-auto resize-y',
        'data-placeholder': placeholder || 'Descrição do produto...',
      },
    },
  });

  return React.createElement(EditorContent, {
    editor,
    className: editor?.isEmpty ? 'is-empty' : '',
  });
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

module.exports = RichTextEditor;
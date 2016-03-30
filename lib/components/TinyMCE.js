'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _isEqual = require('../../node_modules/lodash/lang/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _clone = require('lodash/lang/clone');

var _clone2 = _interopRequireDefault(_clone);

var _uuid = require('../helpers/uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _ucFirst = require('../helpers/ucFirst');

var _ucFirst2 = _interopRequireDefault(_ucFirst);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Include all of the Native DOM and custom events from:
// https://github.com/tinymce/tinymce/blob/master/tools/docs/tinymce.Editor.js#L5-L12
var EVENTS = ['focusin', 'focusout', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'beforepaste', 'paste', 'cut', 'copy', 'selectionchange', 'mouseout', 'mouseenter', 'mouseleave', 'keydown', 'keypress', 'keyup', 'contextmenu', 'dragend', 'dragover', 'draggesture', 'dragdrop', 'drop', 'drag', 'BeforeRenderUI', 'SetAttrib', 'PreInit', 'PostRender', 'init', 'deactivate', 'activate', 'NodeChange', 'BeforeExecCommand', 'ExecCommand', 'show', 'hide', 'ProgressState', 'LoadContent', 'SaveContent', 'BeforeSetContent', 'SetContent', 'BeforeGetContent', 'GetContent', 'VisualAid', 'remove', 'submit', 'reset', 'BeforeAddUndo', 'AddUndo', 'change', 'undo', 'redo', 'ClearUndos', 'ObjectSelected', 'ObjectResizeStart', 'ObjectResized', 'PreProcess', 'PostProcess', 'focus', 'blur', 'dirty'];

// Note: because the capitalization of the events is weird, we're going to get
// some inconsistently-named handlers, for example compare:
// 'onMouseleave' and 'onNodeChange'
var HANDLER_NAMES = EVENTS.map(function (event) {
  return 'on' + (0, _ucFirst2.default)(event);
});

var TinyMCE = _react2.default.createClass({
  displayName: 'TinyMCE',

  propTypes: {
    config: _react2.default.PropTypes.object,
    content: _react2.default.PropTypes.string,
    id: _react2.default.PropTypes.string,
    className: _react2.default.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      config: {},
      content: ''
    };
  },
  componentWillMount: function componentWillMount() {
    this.id = this.id || this.props.id || (0, _uuid2.default)();
  },
  componentDidMount: function componentDidMount() {
    var config = (0, _clone2.default)(this.props.config);
    this._init(config, this.props.content);
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var _this = this;

    if (!(0, _isEqual2.default)(this.props.config, nextProps.config)) {
      this._init(nextProps.config, nextProps.content);
    }
    if (!(0, _isEqual2.default)(this.props.id, nextProps.id)) {
      this.id = nextProps.id;
    }

    var recSetContent = function recSetContent() {
      var editor = tinymce.EditorManager.get(_this.id);
      if (_this.to) {
        clearTimeout(_this.to);
      }

      if (editor) {
        if (!(0, _isEqual2.default)(editor.getContent({ format: 'raw' }), nextProps.content)) {
          editor.setContent(nextProps.content);
          editor.selection.select(editor.getBody(), true);
          editor.selection.collapse(false);
        }
      } else {
        _this.to = setTimeout(recSetContent, 25);
      }
    };

    recSetContent();
  },
  shouldComponentUpdate: function shouldComponentUpdate(nextProps) {
    return !(0, _isEqual2.default)(this.props.content, nextProps.content) || !(0, _isEqual2.default)(this.props.config, nextProps.config);
  },
  componentWillUnmount: function componentWillUnmount() {
    this._remove();
  },
  render: function render() {
    return this.props.config.inline ? _react2.default.createElement('div', {
      id: this.id,
      className: this.props.className,
      dangerouslySetInnerHTML: { __html: this.props.content }
    }) : _react2.default.createElement('textarea', {
      id: this.id,
      className: this.props.className,
      defaultValue: this.props.content,
      placeholder: this.props.placeholder ? this.props.placeholder : ''
    });
  },
  _init: function _init(config, content) {
    var _this2 = this;

    if (this._isInit) {
      this._remove();
    }

    // hide the textarea that is me so that no one sees it
    (0, _reactDom.findDOMNode)(this).style.hidden = 'hidden';

    config.selector = '#' + this.id;
    config.setup = function (editor) {
      EVENTS.forEach(function (event, index) {
        var handler = _this2.props[HANDLER_NAMES[index]];
        if (typeof handler !== 'function') return;
        editor.on(event, function (e) {
          // native DOM events don't have access to the editor so we pass it here
          handler(e, editor);
        });
      });
      // need to set content here because the textarea will still have the
      // old `this.props.content`
      if (content) {
        editor.on('init', function () {
          editor.setContent(content);
        });
      }
    };

    tinymce.init(config);

    (0, _reactDom.findDOMNode)(this).style.hidden = '';

    this._isInit = true;
  },
  _remove: function _remove() {
    tinymce.EditorManager.execCommand('mceRemoveEditor', true, this.id);
    this._isInit = false;
  }
});

// add handler propTypes
HANDLER_NAMES.forEach(function (name) {
  TinyMCE.propTypes[name] = _react2.default.PropTypes.func;
});

module.exports = TinyMCE;
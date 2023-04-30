function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * This is an example using pure React, with no JSX
 * If you would like to use JSX, you will need to use Babel to transpile your code
 * from JSK to JS. You will also need to use a task runner/module bundler to
 * help build your app before it can be used in the browser.
 * Some task runners/module bundlers are : gulp, grunt, webpack, and Parcel
 */
import * as Setup from "./setup_page.js";
import * as Validation from "./validation.js";
import "../../components/lib/regenerator-runtime/runtime.js";

require.config({
  paths: {
    react: "../app/" + app_name + "/javascript/vendor/react.production.min"
  },
  scriptType: "module"
});

define(["react", "splunkjs/splunk"], function (React, splunk_js_sdk) {
  var e = React.createElement;

  var SetupPage = /*#__PURE__*/function (_React$Component) {
    _inherits(SetupPage, _React$Component);

    var _super = _createSuper(SetupPage);

    function SetupPage(props) {
      var _this;

      _classCallCheck(this, SetupPage);

      _this = _super.call(this, props);
      _this.state = {
        loading: true,
        is_configured: 0,
        successfullyUpdated: null,
        form: {
          token: '',
          max_pages_value: 1,
          validation: {
            token: {
              empty: false
            },
            max_pages_value: {
              empty: false,
              out_of_range: false,
              non_numeric: false
            }
          }
        }
      };
      _this.handleChange = _this.handleChange.bind(_assertThisInitialized(_this));
      _this.handleSubmit = _this.handleSubmit.bind(_assertThisInitialized(_this));
      return _this;
    }

    _createClass(SetupPage, [{
      key: "handleChange",
      value: function handleChange(event) {
        var newState = Object.assign({}, this.state);
        newState.form[event.target.name] = event.target.value;
        this.setState(newState);
      }
    }, {
      key: "handleSubmit",
      value: function () {
        var _handleSubmit = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(event) {
          var _this2 = this;

          var validation_check, newState, response;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  event.preventDefault();
                  _context.next = 3;
                  return Validation.check(this.state);

                case 3:
                  validation_check = _context.sent;

                  if (!validation_check.errors) {
                    _context.next = 9;
                    break;
                  }

                  newState = Object.assign({}, validation_check.original);
                  this.setState(newState);
                  _context.next = 14;
                  break;

                case 9:
                  _context.next = 11;
                  return Setup.perform(splunk_js_sdk, this.state.form);

                case 11:
                  response = _context.sent;
                  console.log('response ::: ', response);

                  if (response === 'success') {
                    this.setState(function (prevState) {
                      return _objectSpread(_objectSpread({}, prevState), {}, {
                        is_configured: 1,
                        successfullyUpdated: true,
                        form: _objectSpread(_objectSpread({}, prevState.form), {}, {
                          token: ''
                        })
                      });
                    });
                    setTimeout(function () {
                      _this2.setState({
                        successfullyUpdated: null
                      });
                    }, 3500);
                  } else if (response === 'error') {
                    this.setState({
                      successfullyUpdated: false
                    });
                  }

                case 14:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function handleSubmit(_x) {
          return _handleSubmit.apply(this, arguments);
        }

        return handleSubmit;
      }()
    }, {
      key: "componentWillMount",
      value: function () {
        var _componentWillMount = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          var _this3 = this;

          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return Setup.get_initial_state(splunk_js_sdk).then(function (data) {
                    _this3.setState(function (prevState) {
                      return _objectSpread(_objectSpread({}, prevState), {}, {
                        loading: false,
                        is_configured: data.is_configured,
                        form: _objectSpread(_objectSpread({}, prevState.form), {}, {
                          max_pages_value: data.max_pages
                        })
                      });
                    });
                  });

                case 2:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function componentWillMount() {
          return _componentWillMount.apply(this, arguments);
        }

        return componentWillMount;
      }()
    }, {
      key: "render",
      value: function render() {
        var isLoading = this.state.loading;
        var view;

        if (isLoading) {
          view = /*#__PURE__*/React.createElement("p", null, "Loading...");
        } else {
          view = /*#__PURE__*/React.createElement("div", null, this.state.successfullyUpdated ? /*#__PURE__*/React.createElement("div", {
            className: "success"
          }, /*#__PURE__*/React.createElement("p", null, "Successfully Updated")) : this.state.successfullyUpdated === false ? /*#__PURE__*/React.createElement("div", {
            className: "error"
          }, /*#__PURE__*/React.createElement("p", null, "Could not save.", /*#__PURE__*/React.createElement("br", null), "An error occurred.")) : '', /*#__PURE__*/React.createElement("form", {
            onSubmit: this.handleSubmit
          }, /*#__PURE__*/React.createElement("p", {
            "class": "note"
          }, /*#__PURE__*/React.createElement("small", null, "This app does not support free Shodan API keys.")),
          /*#__PURE__*/React.createElement("div", {
            className: "control-group"
          }, /*#__PURE__*/React.createElement("label", null, "API Key"), /*#__PURE__*/React.createElement("input", {
            type: "text",
            value: this.state.form.token,
            name: "token",
            onChange: this.handleChange
          }), this.state.form.validation.token.empty ? /*#__PURE__*/React.createElement("p", {
            className: "input-error"
          }, "You must provide an API Key.") : ''), /*#__PURE__*/React.createElement("div", {
            className: "control-group"
          }, /*#__PURE__*/React.createElement("label", null, "Max Pages"), /*#__PURE__*/React.createElement("input", {
            type: "number",
            defaultValue: this.state.form.max_pages_value,
            name: "max_pages_value",
            onChange: this.handleChange
          }), /*#__PURE__*/React.createElement("p", {
            "class": "note"
          }, /*#__PURE__*/React.createElement("small", null, "Warning: Increasing the 'Max Pages' value can cause you to hit your Shodan API limit much faster.")), this.state.form.validation.max_pages_value.empty ? /*#__PURE__*/React.createElement("p", {
            className: "input-error"
          }, "You must provide a max pages value.") : '', this.state.form.validation.max_pages_value.non_numeric ? /*#__PURE__*/React.createElement("p", {
            className: "input-error"
          }, "Value must be a number.") : '', this.state.form.validation.max_pages_value.out_of_range ? /*#__PURE__*/React.createElement("p", {
            className: "input-error"
          }, "Cannot be less than 1.") : ''), /*#__PURE__*/React.createElement("button", {
            type: "submit",
            className: "btn btn-primary"
          }, "Save Configuration")), this.state.is_configured == 1 ? /*#__PURE__*/React.createElement("div", {
            className: "grey"
          }, /*#__PURE__*/React.createElement("p", null, "This app is configured.")) : /*#__PURE__*/React.createElement("div", {
            className: "warn"
          }, /*#__PURE__*/React.createElement("p", null, "This app is not currently configured.")));
        }

        return view;
      }
    }]);

    return SetupPage;
  }(React.Component);

  return e(SetupPage);
});
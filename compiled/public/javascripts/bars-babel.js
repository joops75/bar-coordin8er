'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dateFilter = function dateFilter(attendedBy) {
  var attendedByFiltered = attendedBy.filter(function (attendee) {
    return nextMidnight(Date.now()) == nextMidnight(attendee.date);
  });
  return attendedByFiltered;
};
var nextMidnight = function nextMidnight(dateInMilliseconds) {
  var dayMilliseconds = 1000 * 60 * 60 * 24;
  return Math.ceil(dateInMilliseconds / dayMilliseconds) * dayMilliseconds;
};

var SearchResults = function (_React$Component) {
  _inherits(SearchResults, _React$Component);

  function SearchResults(props) {
    _classCallCheck(this, SearchResults);

    var _this = _possibleConstructorReturn(this, (SearchResults.__proto__ || Object.getPrototypeOf(SearchResults)).call(this, props));

    _this.state = {
      bars: '',
      limit: 20,
      offset: 0,
      currentPage: 1
    };
    _this.input = _this.input.bind(_this); //not sure why this needs binding as it isn't passed down as props
    _this.clickSearch = _this.clickSearch.bind(_this);
    _this.clickPage = _this.clickPage.bind(_this);
    _this.attendBar = _this.attendBar.bind(_this);
    return _this;
  }

  _createClass(SearchResults, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', appUrl + '/api/:id', function (data) {
        if (data.split('', 1)[0] == '{') {
          //confirms response data is an object and thus logged in
          var parsedData = JSON.parse(data);
          var username = parsedData.github.username;
          var attending = parsedData.attending;
          if (attending.length > 0) attending = dateFilter(attending);
          _this2.setState({
            username: username,
            attending: attending
          });
        }
        if (sessionStorage.getItem('yelpBarsData')) {
          var localData = JSON.parse(sessionStorage.getItem('yelpBarsData'));
          $('#termSearchBox')[0].value = localData.term;
          $('#townSearchBox')[0].value = localData.location.split(',')[2];

          var countryCodeValue = localData.location.split(',')[4];
          var keyMatcher = function keyMatcher(countryCode) {
            return countryCode.Code == countryCodeValue;
          };
          var countryNameIndex = countryCodes.findIndex(keyMatcher);
          var countryName = countryCodes[countryNameIndex].Name;
          $('#countryButton')[0].textContent = countryName;

          _this2.setState({
            bars: localData.bars,
            currentPage: localData.currentPage
          });
          _this2.getAttendees(localData.bars);
        }
      }));
    }
  }, {
    key: 'getAttendees',
    value: function getAttendees(bars) {
      var url = appUrl + '/api/:id/getAttendees';

      var _loop = function _loop(i) {
        barId = bars.businesses[i].id;

        ajaxFunctions.ready(ajaxFunctions.ajaxAttendance('GET', url, barId, function (number) {
          $('#attendButton_' + i)[0].textContent = number + ' going';
        }));
      };

      for (var i = 0; i < bars.businesses.length; i++) {
        var barId;

        _loop(i);
      }
    }
  }, {
    key: 'search',
    value: function search(pageRequest) {
      var _this3 = this;

      var url = appUrl + '/api/:id/bars';
      var term = $('#termSearchBox')[0].value;
      var address = "''",
          neighborhood = "''",
          city = "''",
          stateOrZip = "''",
          country = "''";
      var city = $('#townSearchBox')[0].value;

      var countryName = $('#countryButton')[0].textContent;
      var keyMatcher = function keyMatcher(countryCode) {
        return countryCode.Name == countryName;
      };
      var countryCodeIndex = countryCodes.findIndex(keyMatcher);
      country = countryCodes[countryCodeIndex].Code;

      var location = address + ',' + neighborhood + ',' + city + ',' + stateOrZip + ',' + country;
      var limit = this.state.limit;
      var currentPage;
      pageRequest ? currentPage = parseInt(pageRequest, 10) : currentPage = 1;
      var offset = limit * (currentPage - 1);
      ajaxFunctions.ready(ajaxFunctions.ajaxBarRequest('GET', url, term, location, limit, offset, function (data) {
        var parsedData = JSON.parse(data);
        _this3.setState({
          bars: parsedData,
          currentPage: currentPage
        });
        _this3.getAttendees(parsedData);
        // save data locally
        var yelpBarsData = {
          term: term,
          location: location,
          currentPage: currentPage,
          bars: parsedData
        };
        sessionStorage.setItem('yelpBarsData', JSON.stringify(yelpBarsData));
      }));
    }
  }, {
    key: 'input',
    value: function input(e) {
      if (e.which == 13) {
        this.search();
      }
    }
  }, {
    key: 'clickSearch',
    value: function clickSearch() {
      this.search();
    }
  }, {
    key: 'clickList',
    value: function clickList(e) {
      $('#countryButton')[0].textContent = e.target.textContent;
    }
  }, {
    key: 'clickPage',
    value: function clickPage(e) {
      if (e.target.className == 'page') {
        var pageRequest = e.target.textContent;
        this.search(pageRequest);
      }
    }
  }, {
    key: 'logout',
    value: function logout() {
      sessionStorage.removeItem('yelpBarsData');
    }
  }, {
    key: 'attendBar',
    value: function attendBar(e) {
      var i = e.target.id.split('_')[1];
      if (!this.state.username) {
        $('#attendNotice_' + i).css('display', 'inline').fadeOut(3000);
      } else {
        var url = appUrl + '/api/:id/attendBar';
        var barId = this.state.bars.businesses[i].id;
        ajaxFunctions.ready(ajaxFunctions.ajaxAttendance('POST', url, barId, function (number) {
          $('#attendButton_' + i)[0].textContent = number + ' going';
          $('#attending_' + i)[0].style.display == 'none' ? $('#attending_' + i).css('display', '') : $('#attending_' + i).css('display', 'none');
        }));
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var headerStyle = function headerStyle() {
        if (!_this4.state.username) return { visibility: 'hidden' };
      };
      var loginButtonStyle = function loginButtonStyle() {
        if (_this4.state.username) return { display: 'none' };
      };
      var logoutButtonStyle = function logoutButtonStyle() {
        if (!_this4.state.username) return { display: 'none' };
      };
      return React.createElement(
        'div',
        null,
        React.createElement(
          'h2',
          null,
          'Bar Coordin8er'
        ),
        React.createElement(
          'div',
          { className: 'navigation' },
          React.createElement(
            'a',
            { href: '/auth/github' },
            React.createElement(
              'button',
              { className: 'btn btn-primary height-restrict-btn inline float-right', style: loginButtonStyle() },
              React.createElement('i', { className: 'fa fa-github' }),
              ' Login'
            )
          ),
          React.createElement(
            'a',
            { href: '/logout' },
            React.createElement(
              'button',
              { className: 'btn btn-primary height-restrict-btn inline float-right', style: logoutButtonStyle(), onClick: this.logout },
              React.createElement('i', { className: 'fa fa-github' }),
              ' Logout'
            )
          ),
          React.createElement(
            'span',
            { className: 'height-restrict inline float-right', style: headerStyle() },
            'Welcome, ',
            this.state.username
          ),
          React.createElement('input', { id: 'termSearchBox', className: 'height-restrict', type: 'text', placeholder: 'Enter search term', onKeyDown: this.input }),
          React.createElement('input', { id: 'townSearchBox', className: 'height-restrict', type: 'text', placeholder: 'Enter town/city', onKeyDown: this.input }),
          React.createElement(
            'span',
            { className: 'dropdown height-restrict' },
            React.createElement(
              'button',
              { id: 'countryButton', className: 'btn btn-primary dropdown-toggle height-restrict-btn', type: 'button', 'data-toggle': 'dropdown' },
              'United States'
            ),
            React.createElement(List, { clickList: this.clickList })
          ),
          React.createElement(
            'button',
            { className: 'btn btn-primary height-restrict-btn', onClick: this.clickSearch },
            'Go!'
          )
        ),
        React.createElement(Bars, { bars: this.state.bars, attendBar: this.attendBar, attending: this.state.attending }),
        React.createElement(Pages, { totalBars: this.state.bars.total, limit: this.state.limit, offset: this.state.offset, currentPage: this.state.currentPage, clickPage: this.clickPage })
      );
    }
  }]);

  return SearchResults;
}(React.Component);

function List(props) {
  var countries = countryCodes.map(function (country, i) {
    return React.createElement(
      'li',
      { key: 'list_' + i, id: 'list_' + i, onClick: props.clickList },
      country.Name
    );
  });
  return React.createElement(
    'ul',
    { className: 'dropdown-menu', size: '20' },
    countries
  );
}

function Bars(props) {
  if (props.bars) {
    var bars = props.bars.businesses.map(function (bar, i) {
      var img;
      bar.image_url ? img = React.createElement('img', { src: bar.image_url }) : img = React.createElement('img', { src: '/public/img/NoImageAvailable.png' });
      var barMatch = false;
      if (props.attending && props.attending.length > 0) {
        for (var _i in props.attending) {
          if (props.attending[_i].id == bar.id) {
            barMatch = true;
            break;
          }
        }
      }
      var attendingDisplay;
      barMatch ? attendingDisplay = { display: '' } : attendingDisplay = { display: 'none' };

      return React.createElement(
        'div',
        { key: 'bars_' + i, className: 'results row-height' },
        React.createElement(
          'div',
          { className: 'inline' },
          React.createElement(
            'div',
            { className: 'inline' },
            img
          ),
          React.createElement(
            'div',
            { className: 'inline' },
            React.createElement(
              'a',
              { href: bar.url, target: '_blank' },
              React.createElement(
                'span',
                null,
                bar.name
              )
            )
          ),
          React.createElement(
            'span',
            null,
            'Rating: ',
            bar.rating
          ),
          React.createElement(
            'span',
            null,
            'Price: ',
            bar.price
          )
        ),
        React.createElement(
          'div',
          { className: 'inline float-right' },
          React.createElement(
            'span',
            { id: 'attendNotice_' + i, className: 'line-height', style: { display: 'none' } },
            'Please login to declare atttendance!'
          ),
          React.createElement(
            'span',
            { id: 'attending_' + i, className: 'line-height', style: attendingDisplay },
            'Attending this bar!'
          ),
          React.createElement(
            'button',
            { id: 'attendButton_' + i, className: 'btn btn-primary height-restrict-btn float-right', style: { marginTop: '35px' }, onClick: props.attendBar },
            '0 going'
          )
        )
      );
    });
    return React.createElement(
      'div',
      null,
      bars
    );
  } else {
    return null;
  }
}

function Pages(props) {
  if (props.totalBars && props.totalBars > props.limit) {
    var numPages = Math.min(Math.ceil(props.totalBars / props.limit), Math.floor(1000 / props.limit)); //can only search for the first 1000 businesses on yelp api
    var pagesArr = [];
    for (var i = 1; i <= numPages; i++) {
      pagesArr.push(i);
    }
    var pages = pagesArr.map(function (page, i) {
      var classNameDetails;
      props.currentPage == page ? classNameDetails = 'nopage' : classNameDetails = 'page';
      return React.createElement(
        'span',
        { key: 'pages_' + i },
        React.createElement(
          'span',
          { className: classNameDetails, onClick: props.clickPage },
          page
        ),
        ' '
      );
    });
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { className: 'navigation' },
        'Skip to page:'
      ),
      React.createElement(
        'div',
        { className: 'pages' },
        pages
      )
    );
  } else {
    return null;
  }
}

ReactDOM.render(React.createElement(SearchResults, null), document.getElementById('target'));
//# sourceMappingURL=bars-babel.js.map

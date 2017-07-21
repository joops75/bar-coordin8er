      var dateFilter = function(attendedBy) {
        var attendedByFiltered = attendedBy.filter(function(attendee) {
          return nextMidnight(Date.now()) == nextMidnight(attendee.date)
        })
        return attendedByFiltered
      }
      var nextMidnight = function(dateInMilliseconds) {
        var dayMilliseconds = 1000 * 60 * 60 * 24
        return Math.ceil(dateInMilliseconds / dayMilliseconds) * dayMilliseconds
      }
      class SearchResults extends React.Component {
        constructor(props) {
          super(props)
          this.state = {
            bars: '',
            limit: 20,
            offset: 0,
            currentPage: 1
          }
          this.input = this.input.bind(this)//not sure why this needs binding as it isn't passed down as props
          this.clickSearch = this.clickSearch.bind(this)
          this.clickPage = this.clickPage.bind(this)
          this.attendBar = this.attendBar.bind(this)
        }
        componentWillMount() {
          ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', appUrl + '/api/:id', (data) => {
            if (data.split('', 1)[0] == '{') {//confirms response data is an object and thus logged in
              var parsedData = JSON.parse(data)
              var username = parsedData.github.username
              var attending = parsedData.attending
              if (attending.length > 0) attending = dateFilter(attending)
              this.setState({
                username: username,
                attending: attending
              })
            }
            if (sessionStorage.getItem('yelpBarsData')) {
              var localData = JSON.parse(sessionStorage.getItem('yelpBarsData'))
              $('#termSearchBox')[0].value = localData.term
              $('#townSearchBox')[0].value = localData.location.split(',')[2]
              
              var countryCodeValue = localData.location.split(',')[4]
              var keyMatcher = function(countryCode) {
                return countryCode.Code == countryCodeValue
              }
              var countryNameIndex = countryCodes.findIndex(keyMatcher)
              var countryName = countryCodes[countryNameIndex].Name
              $('#countryButton')[0].textContent = countryName
              
              this.setState({
                bars: localData.bars,
                currentPage: localData.currentPage
              })
              this.getAttendees(localData.bars)
            }
          }))
        }
        getAttendees(bars) {
          var url = appUrl + '/api/:id/getAttendees'
          for (let i = 0; i < bars.businesses.length; i++) {
            var barId = bars.businesses[i].id
            ajaxFunctions.ready(ajaxFunctions.ajaxAttendance('GET', url, barId, (number) => {
              $('#attendButton_' + i)[0].textContent = number + ' going'
            }))
          }
        }
        search(pageRequest) {
          var url = appUrl + '/api/:id/bars'
          var term = $('#termSearchBox')[0].value
          var address = "''", neighborhood = "''", city = "''", stateOrZip = "''", country = "''"
          var city = $('#townSearchBox')[0].value
          
          var countryName = $('#countryButton')[0].textContent
          var keyMatcher = function(countryCode) {
            return countryCode.Name == countryName
          }
          var countryCodeIndex = countryCodes.findIndex(keyMatcher)
          country = countryCodes[countryCodeIndex].Code
          
          var location = address + ',' + neighborhood + ',' + city + ',' + stateOrZip + ',' + country
          var limit = this.state.limit
          var currentPage
          pageRequest? currentPage = parseInt(pageRequest, 10) : currentPage = 1
          var offset = limit * (currentPage - 1)
          ajaxFunctions.ready(ajaxFunctions.ajaxBarRequest('GET', url, term, location, limit, offset, (data) => {
            var parsedData = JSON.parse(data)
            this.setState({
              bars: parsedData,
              currentPage: currentPage
            })
            this.getAttendees(parsedData)
            // save data locally
            var yelpBarsData = {
              term: term,
              location: location,
              currentPage: currentPage,
              bars: parsedData
            }
            sessionStorage.setItem('yelpBarsData', JSON.stringify(yelpBarsData))
          }))
        }
        input(e) {
          if (e.which == 13) {
            this.search()
          }
        }
        clickSearch() {
          this.search()
        }
        clickList(e) {
          $('#countryButton')[0].textContent = e.target.textContent
        }
        clickPage(e) {
          if (e.target.className == 'page') {
            var pageRequest = e.target.textContent
            this.search(pageRequest)
          }
        }
        logout() {
          sessionStorage.removeItem('yelpBarsData')
        }
        attendBar(e) {
          var i = e.target.id.split('_')[1]
          if (!this.state.username) {
            $('#attendNotice_' + i).css('display', 'inline').fadeOut(3000)
          } else {
            var url = appUrl + '/api/:id/attendBar'
            var barId = this.state.bars.businesses[i].id
            ajaxFunctions.ready(ajaxFunctions.ajaxAttendance('POST', url, barId, (number) => {
              $('#attendButton_' + i)[0].textContent = number + ' going'
              $('#attending_' + i)[0].style.display == 'none' ? $('#attending_' + i).css('display', '') : $('#attending_' + i).css('display', 'none')
            }))
          }
        }
        render() {
          var headerStyle = () => {
            if (!this.state.username) return {visibility: 'hidden'}
          }
          var loginButtonStyle = () => {
            if (this.state.username) return {display: 'none'}
          }
          var logoutButtonStyle = () => {
            if (!this.state.username) return {display: 'none'}
          }
          return (
            <div>
              <h2>Bar Coordin8er</h2>
              <div className="navigation">
                <a href="/auth/github"><button className="btn btn-primary height-restrict-btn inline float-right" style={loginButtonStyle()}><i className='fa fa-github'></i> Login</button></a>
                <a href="/logout"><button className="btn btn-primary height-restrict-btn inline float-right" style={logoutButtonStyle()} onClick={this.logout}><i className='fa fa-github'></i> Logout</button></a>
                <span className="height-restrict inline float-right" style={headerStyle()}>Welcome, {this.state.username}</span>
                <input id='termSearchBox' className="height-restrict" type='text' placeholder='Enter search term' onKeyDown={this.input}/>
                <input id='townSearchBox' className="height-restrict" type='text' placeholder='Enter town/city' onKeyDown={this.input}/>
                <span className="dropdown height-restrict">
                  <button id='countryButton' className="btn btn-primary dropdown-toggle height-restrict-btn" type="button" data-toggle="dropdown">United States</button>
                  <List clickList={this.clickList}/>
                </span> 
                <button className="btn btn-primary height-restrict-btn" onClick={this.clickSearch}>Go!</button>
              </div>
              <Bars bars={this.state.bars} attendBar={this.attendBar} attending={this.state.attending}/>
              <Pages totalBars={this.state.bars.total} limit={this.state.limit} offset={this.state.offset} currentPage={this.state.currentPage} clickPage={this.clickPage}/>
            </div>
          )
        }
      }
      
      function List(props) {
        var countries = countryCodes.map(function(country, i) {
          return <li key={'list_' + i} id={'list_' + i} onClick={props.clickList}>{country.Name}</li>
        })
        return <ul className="dropdown-menu" size='20'>{countries}</ul>
      }
      
      function Bars(props) {
        if (props.bars) {
          var bars = props.bars.businesses.map(function(bar, i) {
            var img
            bar.image_url ? img = <img src={bar.image_url}/> : img = <img src='/public/img/NoImageAvailable.png'/>
            var barMatch = false
            if (props.attending && props.attending.length > 0) {
              for (let i in props.attending) {
                if (props.attending[i].id == bar.id) {
                  barMatch = true
                  break
                }
              }
            }
            var attendingDisplay
            barMatch ? attendingDisplay = {display: ''} : attendingDisplay = {display: 'none'}
            
            return (
              <div key={'bars_' + i} className="results row-height">
                <div className='inline'>
                  <div className='inline'>{img}</div>
                  <div className='inline'><a href={bar.url} target='_blank'><span>{bar.name}</span></a></div>
                  <span>Rating: {bar.rating}</span>
                  <span>Price: {bar.price}</span>
                </div>
                <div className='inline float-right'>
                  <span id={`attendNotice_${i}`} className='line-height' style={{display: 'none'}}>Please login to declare atttendance!</span>
                  <span id={`attending_${i}`} className="line-height" style={attendingDisplay}>Attending this bar!</span>
                  <button id={`attendButton_${i}`} className="btn btn-primary height-restrict-btn float-right" style={{marginTop: '35px'}} onClick={props.attendBar}>0 going</button>
                </div>
              </div>  
            )
          })
          return <div>{bars}</div>
        } else {
          return null
        }
      }
      
      function Pages(props) {
        if (props.totalBars && props.totalBars > props.limit) {
          var numPages = Math.min(Math.ceil(props.totalBars / props.limit), Math.floor(1000 / props.limit))//can only search for the first 1000 businesses on yelp api
          var pagesArr = []
          for (var i = 1; i <= numPages; i++) {
             pagesArr.push(i)
          }
          var pages = pagesArr.map(function(page, i) {
            var classNameDetails
            props.currentPage == page ? classNameDetails = 'nopage' : classNameDetails = 'page'
            return <span key={'pages_' + i}><span className={classNameDetails} onClick={props.clickPage}>{page}</span> </span>
          })
          return (
            <div>
              <div className="navigation">Skip to page:</div>
              <div className='pages'>{pages}</div>
            </div>
          )
        } else {
          return null
        }
      }
      
      ReactDOM.render(<SearchResults />, document.getElementById('target'))
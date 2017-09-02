Feature: test
  Background:
    Given the following initial state:
    """
    {
      data: [
        {_id: constants.ONE},
        {_id: '2'}
      ]
    }
    """

  Scenario: index
    When we HTTP GET '/'
    Then our HTTP response should be like:
    """
    [
      {_id: constants.ONE},
      {_id: '2'}
    ]
    """

  Scenario: index with query
    When we HTTP GET '/' with query 'foo=bar'
    Then our HTTP response should be like:
    """
    [
      {_id: constants.ONE},
      {_id: '2'}
    ]
    """

  Scenario: get
    When we HTTP GET '/${constants.ONE}'
    Then our HTTP response should be like:
    """
    {_id: '1'}
    """

  Scenario: get non-existent
    When we HTTP GET '/nope'
    Then our HTTP response should have status code 404

  Scenario: create
    When we HTTP POST "/" with body:
    """
    {_id: '3'}
    """
    Then our HTTP response should have status code 201
    And our resultant state should be like:
    """
    {
      data: [
        {_id: '1'},
        {_id: '2'},
        {_id: '3'}
      ]
    }
    """

  Scenario: update
    When we HTTP PUT '/2' with body:
    """
    {_id: '2', name: 'two'}
    """
    Then our HTTP response should have status code 204
    And our resultant state should be like:
    """
    {
      data: [
        {},
        {_id: '2', name: 'two'}
      ]
    }
    """

  Scenario: patch
    When we HTTP PATCH '/2' with body:
    """
    {name: 'two'}
    """
    Then our HTTP response should have status code 204
    And our resultant state should be like:
    """
    {
      data: [
        {},
        {_id: '2', name: 'two'}
      ]
    }
    """

  Scenario: update non-existent client
    When we HTTP PUT '/nope' with body:
    """
    {foo: 'bar'}
    """
    Then our HTTP response should have status code 404

  Scenario: delete
    When we HTTP DELETE '/1'
    Then our HTTP response should have status code 204
    And our resultant state should be like:
    """
    {
      data: [
        {_id: '2'}
      ]
    }
    """

  Scenario: delete non-existent
    When we HTTP DELETE '/nope'
    Then our HTTP response should have status code 404

  Scenario: user
    Given we set the following HTTP headers:
    """
    {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaHIiLCJ1c2VySWQiOiIxMjMiLCJ1c2VyTmFtZSI6ImpvaG4gZG9lIiwiY2xpZW50SWQiOiI0NTYifQ.DiomD9RA_lK_e3lz5Yuic6kvlmLXHQqhcdFFyuQwWj4'
    }
    """
    When we HTTP GET "/user"
    Then our HTTP response should be like:
    """
    { iss: 'chr', userId: '123', userName: 'john doe', clientId: '456' }
    """

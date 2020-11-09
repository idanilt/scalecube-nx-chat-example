Feature: High Availability
  Background:
    Given Client

  Scenario: Scale-up
    Given ChatService 3 instances A, B and C
    When ChatService instance D is added
    Then All instances able to persist messages
    And A, B, C messages streams continue to emit new messages
    And New messages streams emit correct values
  Scenario: Scale-down
    Given ChatService 3 instances A, B and C
    When ChatService instance C is removed
    Then All instances able to persist messages
    And A, B messages streams continue to emit new messages
    And New messages streams emit correct values

  Scenario: 2 instances write to the same channel at the same time
    Given ChatService 3 instances A, B, C with message$ steam
    When A write "Hello"
    And B write "World"
    Then All instances able to persist messages

# Specifications

The `tree.json` is a file containing a list of people in the JSON format.
Each person is represented by an object with the following attributes:

| Name      | Type             | Description                                                    |
| --------- | ---------------- | -------------------------------------------------------------- |
| `id`      | Integer          | Only MANDATORY attribute. UNIQUE number identifing the person. |
| `first`   | Text             | First name.                                                    |
| `middle`  | List of text     | List of second names.                                          |
| `last`    | Text             | Last name.                                                     |
| `sex`     | Integer          | Sex. `1=Man, 2=Woman, 3=Other`.                                |
| `dob`     | Text             | Date of birth in the format `AAAA/MM/JJ`.                      |
| `pob`     | Text             | Place of birth.                                                |
| `dod`     | Text             | Date of death in the format `AAAA/MM/JJ`.                      |
| `pod`     | Text             | Place of death.                                                |
| `parents` | List of integers | List of the parents' identifiers.                              |
| `spouses` | List of integers | List of the spouses' identifiers.                              |
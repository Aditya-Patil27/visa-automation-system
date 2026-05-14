


## Software Requirements
## Specification
for

## Visa Automation System

Version 1.0 approved



Prepared by Shravan Kalzunkar



Vishwakarma Institute of Technology



## 04/02/2025













Copyright © 1999 by Karl E. Wiegers. Permission is granted to use, modify, and distribute this document.

Software Requirements Specification for Visa Automation System
Page ii

Table of Contents
Table of Contents .......................................................................................................................... ii
Revision History ............................................................................................................................ ii
- Introduction .............................................................................................................................. 1
1.1 Purpose ............................................................................................................................................. 1
1.2 Document Conventions .................................................................................................................... 1
1.3 Intended Audience and Reading Suggestions................................................................................... 1
1.4 Product Scope ................................................................................................................................... 1
1.5 References ........................................................................................................................................ 1
- Overall Description .................................................................................................................. 2
2.1 Product Perspective .......................................................................................................................... 2
2.2 Product Functions ............................................................................................................................. 2
2.3 User Classes and Characteristics ...................................................................................................... 2
2.4 Operating Environment .................................................................................................................... 3
2.5 Design and Implementation Constraints ........................................................................................... 3
2.6 User Documentation ......................................................................................................................... 4
2.7 Assumptions and Dependencies ....................................................................................................... 4
- External Interface Requirements ............................................................................................ 5
3.1 User Interfaces .................................................................................................................................. 5
3.2 Hardware Interfaces ......................................................................................................................... 5
3.3 Software Interfaces ........................................................................................................................... 6
3.4 Communications Interfaces .............................................................................................................. 6
- System Features ........................................................................................................................ 7
4.1 System Feature 1 .............................................................................................................................. 7
4.2 System Feature 2 (and so on) ........................................................................................................... 7
- Other Nonfunctional Requirements ....................................................................................... 8
5.1 Performance Requirements .............................................................................................................. 8
5.2 Safety Requirements ......................................................................................................................... 8
5.3 Security Requirements ..................................................................................................................... 8
5.4 Software Quality Attributes.............................................................................................................. 8
5.5 Business Rules ................................................................................................................................. 9
- Other Requirements ............................................................................................................... 10
Appendix A: Glossary .................................................................................................................. 10
Appendix B: Analysis Models ..................................................................................................... 11

## Revision History




## Name Date Reason For Changes Version
## Visa Automation
## System
## February
## 2024
## Original Version  Version 1



## Page 1
Software Requirements Specification for Visa Automation System

## 1. Introduction

## 1.1 Purpose
The  purpose  of  this  document  is  to  outline  the  software  requirements  for  the Visa  Consultation  System,
which  aims  to  assist  clients  in  the  visa  application  process.  The  system  will  streamline  consultation,
eligibility assessment, appointment scheduling, document verification, and client support. This SRS covers
the core functionalities required for efficient visa application management.

## 1.2 Document Conventions
This document was made by adhering to IEEE Software Requirements Specification Template

1.3 Intended Audience and Reading Suggestions
 Developers: This group will use this document to understand the technical aspects of the software system
and then use this as a base for creating a system design.
 Testers:  This  group  will  perform  unit  testing  and  performance  testing  on  the  components  mentioned  in
this document to determine how the system performs to external stimuli and whether the response aligns
with this document.
 Users: They can use this document to understand the Visa Consultation System’s features, architecture,
and product deliverables. They can then request changes in the software.

## 1.4 Product Scope
The  Visa  Consultation  System  is  a  streamlined  platform  designed  to  facilitate  and  enhance  the  visa
application  process  for  clients  and  consultants.  Featuring an  intuitive  user  interface,  the  system  allows
clients to seamlessly register, check their eligibility, and book visa appointments efficiently. Additionally, it
enables  consultants  to  verify  documents,  resolve  queries,  and  track  application  progress  in  real-time.  By
integrating automated eligibility assessment and document validation, the system minimizes manual errors
and significantly accelerates the visa processing timeline. Ultimately, the Visa Consultation System aims to
improve  user  experience,  enhance  operational  efficiency,  and  ensure  compliance  with  visa  regulations
worldwide.

## 1.5 References
##  Visa Consultants Guidelines Document
 IEEE Standard for Software Requirements Specifications (IEEE 830-1998)
 Relevant visa processing regulations from different countries




## Page 2
Software Requirements Specification for Visa Automation System

## 2. Overall Description

## 2.1 Product Perspective
The  Visa  Appointment  Process  system  will  be  a  self-contained  application  designed  to  simplify  the visa
appointment scheduling process. It will provide a new solution for users seeking to apply for visas, rather
than  replacing  any  existing  systems.  The  system  will  enable  users  to  complete  tasks  such  as  visa  pre-
assessment,  eligibility  checks,  appointment  scheduling,  and  document  submission  through  a  simple,  user-
friendly interface.
The  system  will  interact  with  external  databases  to  retrieve  country-specific  visa  requirements  and
appointment  availability.  Additionally,  an  administrator  interface  will  be available  for  managing  user
accounts  and  processing  queries. This  product  will  serve  as  a  comprehensive  solution  for  scheduling  visa
appointments and will not be part of a larger product family.

## 2.2 Product Functions
The  Visa  Appointment  Process  system  will perform  several  key  functions  to  facilitate  visa  appointment
scheduling. These functions include:
 User Registration and Login: Allows users to create accounts and securely log in to the system.
 Visa  Pre-Assessment: Collects  necessary  information  from  users and  assesses  their  visa  eligibility
based on the purpose of travel.
 Eligibility  Check: Verifies  whether  the  user  meets  the  visa requirements  for the  selected  destination
country.
 Appointment  Scheduling: Enables users  to choose  and  confirm  available  appointment  slots  for  visa
interviews.
 Document  Upload: Facilitates  the  uploading  of  required  documents  such  as  passports  and  financial
statements.
 Query  Assistance: Provides  users  with  a  platform  to  ask  questions  or  seek  assistance  regarding  the
visa process.
 Notifications  and  Alerts: Sends  timely  updates  and  reminders  regarding  appointments,  document
status, and other relevant information.


2.3 User Classes and Characteristics
The Visa   Appointment   Process system will   cater   to   different   user   classes,   each   with   specific
characteristics  and  needs.  These  user  classes  are  distinguished  by  their  frequency  of  use,  expertise,  and
privileges within the system.




## Page 3
Software Requirements Specification for Visa Automation System

 Typical Users: These are individuals who are applying for a visa. They may have limited technical
expertise  and  will  primarily  use  the  system  for  registering,  completing  visa  pre-assessments,
checking eligibility, scheduling appointments, and uploading documents. They will have basic access
to the system’s functionalities with no administrative privileges.
 Administrator  Users:  These  users  are  responsible  for  managing  and  overseeing  the  entire  visa
appointment  process.  Administrators  will  have  advanced  knowledge  of  the  system,  with  access  to
user  management,  query  resolution,  and  appointment  oversight.  They  will  be  responsible  for
approving  or  rejecting  documents  and  handling  any  escalated  queries.  Administrators  will  have
higher privilege levels, allowing them to modify system settings and manage appointments.
 Consultants/Support  Staff:  These  users  will  assist  typical  users  with  visa-related  queries  and
process-related  issues.  They  may  not  interact  with  the  core  system  functions  like  appointment
scheduling,  but  they  will  have  the  capability  to  answer  client  queries  and  provide  support  via  an
integrated  help  desk  or  chat  feature.  Their  access  is  restricted  to  query  handling  and  basic  user
information.

## 2.4 Operating Environment
 Operating System: Windows 10 (64-bit) or later
 Processor: Intel® Core™ i5-4590 (quad-core) / AMD® Ryzen™ 3 2200G (quad-core)
 Memory: 8 GB RAM
 Storage: 500 MB of available disk space
 Database System: MariaDB (latest stable version)

2.5 Design and Implementation Constraints
The Visa Appointment Process system will face the following constraints:
 Database: The  system  must  use  MariaDB  as  specified  by  the  company,  which  limits  database
options.
 Operating System: The system will be  developed and deployed  only for Windows  10 (64-bit) or
later.
 Security: The  system  must  ensure  secure  handling  of  user  data,  following  relevant  privacy
regulations like GDPR.
 External  Integrations: The  system  must  interface  with  third-party  APIs  for  visa  eligibility  and
appointment scheduling.
 Hardware: The system must operate efficiently with 8 GB of RAM and 500 MB of disk space.
 Development Tools: Specific technologies and  frameworks,  including MariaDB, must be  used as
per company guidelines.






## Page 4
Software Requirements Specification for Visa Automation System


## 2.6 User Documentation
User manual:
A detailed document covering the  setup instructions, software  usage,  warranty information, copyright and
license information will be delivered to the user with product.
Format: IEEE Standard for Software User Documentation.

2.7 Assumptions and Dependencies
## Assumed Factors:
Administrative  Account: The client’s computer must have administrative privileges for the installation
and setup of the system.
Internet  Connectivity: An  active  internet  connection  is  required  for  certain  functionalities,  such  as
accessing external visa eligibility APIs, appointment scheduling, and system updates.
User  Permissions: Users  must  have  the  necessary  permissions  to  upload  documents  and  access  required
information (e.g., passport details, travel history).
System Resources: The client’s system must meet the minimum hardware requirements (8 GB RAM, 500
MB disk space) for optimal system performance.
## Dependencies:
MariaDB: The  system  depends  on  MariaDB  for  database  management.  Any  issues  or  incompatibilities
with this database system could affect the system’s functionality.
Third-Party  APIs: The  system  depends  on  external  APIs  for  visa  eligibility  checks  and  appointment
scheduling. Any changes or downtime in these APIs could disrupt key system functions.
External  Libraries/Frameworks: The  system  may  require  specific  software  libraries  (e.g., for  secure
document handling or data encryption) that must be compatible with the chosen development environment.











## Page 5
Software Requirements Specification for Visa Automation System

## 3. External Interface Requirements

## 3.1 User Interfaces
The  Visa  Appointment  Process  system  will  have  an  intuitive  and  user-friendly  interface  designed  to
facilitate  seamless  interactions  between  the  software  and  the  users.  The  following  are  the  key  logical
characteristics of the user interface:
 Login  Screen: Users  will  enter  their  username,  password,  and  select  the  visa  type  and  destination
country.  The  login  screen  will  have  standard  fields,  a  login  button,  and  a  help  option  for  password
recovery.
 Dashboard: After logging in, users will be redirected to the dashboard. The dashboard will display the
key tasks available:
 Visa Pre-Assessment: A form for entering the travel details and personal information.
 Eligibility Check: A status indicator showing whether the user is eligible for the selected visa.
 Appointment Scheduling: A calendar interface for selecting available slots.
 Document Upload: An option to upload necessary files such as passports, financial statements, etc.
 Query Assistance: A text box for submitting queries regarding the visa process.
 Error  Messages: Standardized  error  messages  will  appear  when  users  encounter  issues,  such  as
incorrect  login  credentials  or  missing  information  during  document  upload.  Messages  will  follow  a
clear, non-technical format to ensure easy understanding.
 Help and Support: Each screen will feature a help button that guides users with instructions or FAQs
for completing their tasks.
All screens will follow the company’s GUI standards for consistent design and usability. The layout will be
clean,  ensuring  essential  elements  are  easy  to  access,  and  the  design  will  be  responsive  to  various  screen
sizes.


## 3.2 Hardware Interfaces
 Device  Types: The  system  will  support  devices  such  as  desktop  computers,  laptops,  and  tablets
running Windows 10 or later.
 Data and Control Interactions: The software will read input from user devices through the graphical
interface (keyboard, mouse, touchscreens) and display output on the screen. Data such as user profiles
and uploaded documents will be processed and stored locally or in the cloud.
 Communication  Protocols: The  system  will  communicate  with  external  hardware  (e.g.,  printers)
using  standard  protocols  like  USB  for  printing  documents  and  Wi-Fi  or  Ethernet  for  network
connectivity.





## Page 6
Software Requirements Specification for Visa Automation System

## 3.3 Software Interfaces
 Database: The  system  will  use  MariaDB  (latest  version)  for  storing  user  information,  appointment
details,  and  visa  data.  It  will  communicate  with  the  database  through  SQL  queries  to  retrieve,  store,
and update records.
 Operating  System: The  software  will  run  on  Windows  10  (64-bit)  or  later,  utilizing  standard
operating system services for file handling, user interface rendering, and system security.
 External APIs: The system will integrate with third-party visa eligibility check APIs and appointment
scheduling services. These APIs will send and receive JSON or XML data to/from the system to verify
user eligibility and provide appointment slot information.
 Libraries/Tools: The  system  will  utilize  libraries  such  as  Python  for  backend  processing,  Flask  for
web server functionality, and Jinja2 for template rendering.


## 3.4 Communications Interfaces
 Web  Communication: The  system  will  communicate  with  the  user  via  web  browsers  using
HTTP/HTTPS protocols. The front-end will be built with modern web technologies (HTML5, CSS3,
JavaScript).
 Email  Notifications: The  system  will  send  email  notifications  (e.g.,  appointment  reminders,
eligibility updates) using SMTP protocol for outbound email communication. The format will follow
standard HTML and plain-text formats for readability.
 Data   Security: All   communications   involving   personal   data   (e.g.,   document   uploads,   visa
information) will be encrypted using SSL/TLS to ensure security during data transmission.
 Data  Transfer  Rates:  The  system  will  support  moderate  data  transfer  rates  (up  to  10  MB/s)  for
document uploads and query responses.
 Synchronization: Data  synchronization  will  occur  in  real-time  between  the  system  and  external
APIs    to    ensure    up-to-date    information    on    visa    eligibility    and    appointment    scheduling.


## Page 7
Software Requirements Specification for Visa Automation System

## 4. System Features

4.1 User Registration and Authentication
This feature allows users (applicants, administrators, and visa officers) to register, log in, and authenticate
securely into the system. High priority as it ensures the integrity and security of the system.
4.1.1 Description and Priority
This feature allows secure user registration and login. High priority as it ensures secure
access to the system.
4.1.2 Stimulus/Response Sequences
 Stimulus: User submits registration form (username, password, email).
Response: System validates and sends confirmation email.
 Stimulus: User submits login credentials.
Response: System authenticates and grants access or shows error.
 Stimulus: User requests password reset.
Response: System sends reset link.
## 4.1.3 Functional Requirements
 REQ-1: Register users with username, password, and email.
 REQ-2: Store passwords securely using hashing algorithms.
 REQ-3: Provide password reset via email.
 REQ-4: Display error for incorrect credentials.
 REQ-5: Authenticate based on username/email and password.


4.2 Chatbot  and Eligibility Check
4.2.1 4.2.1 Description and Priority
The chatbot helps users with visa-related queries, guides them through the application
process, and checks document eligibility based on country-specific requirements. It provides
clear feedback and suggestions for improvement if the user is ineligible.  High priority for
improving user experience and visa application efficiency
4.2.2 4.2.2 Stimulus/Response Sequences
 Stimulus: The user asks about the visa application process.
Response: The chatbot provides clear, simple instructions.
 Stimulus: The user asks if their passport is eligible.
Response: The chatbot checks the eligibility and gives feedback.
 Stimulus: The user asks about alternative visa options.
Response: If ineligible, the chatbot suggests alternative visas or improvements.
## 4.2.3 Functional Requirements
 REQ-1: The chatbot must provide clear and concise responses to user queries.
 REQ-2: The chatbot must be user-friendly and easy to interact with.
 REQ-3: The chatbot must analyze documents and provide visa eligibility feedback
based on country requirements.
 REQ-4: If ineligible, the chatbot suggests alternative visas or eligibility improvements.
 REQ-5: The system must allow users to explore other visas or improve eligibility.



## Page 8
Software Requirements Specification for Visa Automation System

## 5. Other Nonfunctional Requirements

## 5.1 Performance Requirements
 Response  Time: User  actions  (form  submissions,  queries)  must  process  within  2  seconds,  while
authentication should complete in 1 second.
 Concurrent Users: Supports 500+ concurrent users with 99.9% uptime, even during peak traffic.
 Database Performance: SQL/MongoDB queries should execute within 100 ms, handling 100 QPS
without degradation.
 Scalability: Supports horizontal scaling and auto-scaling for peak load handling.
 Load Tolerance: Handles 3x traffic surges and remains functional at 80% CPU/memory utilization.
 Processing  Speed: Document  verification  via  OCR/AI  completes  within  5  seconds,  visa  pre-
assessment within 3 seconds.
 API   Efficiency: REST  API  response  time  should  be  ≤200  ms,  with  external  integrations
(email/SMS) not exceeding 500 ms.

## 5.2 Safety Requirements
Database Security: Ensure that malicious database queries cannot be generated using database query
generation feature.
User Authentication: Username and password are required to access the database.

## 5.3 Security Requirements
 User  Authentication: Users  must  log  in  using  a  username  and  password,  with  an  option  for
password recovery via email.
 Access  Control: Only  authorized  users  (applicants,  admins)  can  access  specific  features  based  on
their roles.
 Data Protection: Sensitive user information (e.g., personal details,  uploaded documents) should be
encrypted and stored securely.

## 5.4 Software Quality Attributes
 Usability: The  system  should  provide  a  straightforward  and  interactive  interface,  allowing  users  to
easily register, schedule appointments, and track their visa status.
 Reliability: The  system  must  ensure  accurate  data  processing  for  visa  applications,  minimizing
errors in user authentication, appointment scheduling, and document submission.
 Security: Basic security measures such as user authentication, encrypted data storage, and role-based
access control should be in place to protect sensitive information.


## Page 9
Software Requirements Specification for Visa Automation System

 Scalability: The system should handle multiple users simultaneously, allowing smooth operation as
more applicants register and book appointments.
 Maintainability: The  system  architecture  should  support  easy  modifications,  enabling  future
enhancements like automated document verification and AI-based pre-assessment.

## 5.5 Business Rules
There are no Business Requirements for this Project.


























## Page 10
Software Requirements Specification for Visa Automation System

## Appendix A: Glossary




























## Term Definition
Database A  structured  collection  of  data  stored  electronically,
used for managing visa applications, user records, and
appointments.
API (Application Programming
## Interface)
A  set  of  rules  enabling  communication  between  the
Visa  Automation  System  and  external  services  like
document verification or payment gateways.
MariaDB An  open-source  relational  database  system  used  to
store structured visa-related data securely
Data Encryption A security measure ensuring that sensitive information
(e.g.,   passport   details)   is   stored   and   transmitted
securely.
XML (Extensible Markup Language) A  format  used  for  storing  and  exchanging  structured
visa application data between systems
JSON (JavaScript Object Notation) A  lightweight  data  format  used  for  transmitting  user
and appointment data in API responses.


## Page 11
Software Requirements Specification for Visa Automation System

## Appendix B: Analysis Models

































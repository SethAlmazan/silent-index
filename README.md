## Internal Codename

Silent Index

## Project Description

Chainventory is a web-based DENR - Eastern Samar Chainsaw Management System designed to manage chainsaw registration, permit records, owner information, inspection images, and reports in a centralized platform.

The system allows authenticated users to register chainsaw information, store owner and permit details, upload required images, view and manage records, monitor registration status, export chainsaw permit documents, and access reports. Chainventory helps improve the organization, accessibility, and monitoring of chainsaw-related records.

## Internal Release Code

| Internal Release Code | Date Released |
| --------------------- | ------------- |
| SI.010.003            | 2026-06-08    |
| SI.010.002            | 2026-06-03    |
| SI.010.001            | 2026-06-02    |

## SI.010.003 Release Notes

### Chainsaw Permit Export and Registration Details Release

This release adds chainsaw permit export support and additional registration details fields based on the latest feature/export branch updates.

### Major Changes

* Added chainsaw permit export feature
* Added Microsoft Word document export for individual chainsaw records
* Added DENR logo support for exported permit documents
* Added formatted permit layout based on the chainsaw permit format
* Added automatic owner information in exported permit documents
* Added automatic chainsaw information in exported permit documents
* Added automatic registration date and expiry date in exported permit documents
* Added inspection images to exported permit documents
* Updated export to use inspection images only
* Improved permit document spacing and formatting
* Added new chainsaw information fields:

  * Country of Origin/Source
  * Purchase Price/Selling Price
* Added new registration details fields:

  * Registration No.
  * Purpose
  * Area/Location the chainsaw will be used
* Updated chainsaw records to display the new fields
* Updated record details to show the new fields
* Updated edit record form to allow updating the new fields
* Added model display cleanup to avoid repeating brand name beside the model
* Updated package dependencies for document export support

### Completed Features Added in This Release

* Export individual chainsaw permit as a Microsoft Word file
* Auto-fill permit document using saved record data
* Include inspection images in exported permit
* Save additional permit-related registration fields
* View additional permit-related fields in record details
* Edit additional permit-related fields in existing records

### Known Issues

* No known issues as of this release.

### Available in Next Builds/Releases

* Further permit layout refinements, if needed.
* Optional admin approval workflow for newly registered users.
* Additional export customization, if needed.

## SI.010.002 Release Notes

### Bug Fix and Responsiveness Release

This release contains bug fixes, layout adjustments, and responsiveness improvements after the initial completed release of Chainventory.

### Major Changes

* Fixed mobile responsiveness issues
* Improved responsive layout
* Fixed chainsaw records table responsiveness
* Improved registration form layout on mobile
* Added labels for registration date and expiry date
* Improved spacing in registration details
* Updated README release documentation

### Known Issues

* No known issues as of this release.

### Available in Next Builds/Releases

* Maintenance updates and minor improvements, if needed.

## SI.010.001 Release Notes

### Initial Completed Release

This release contains the completed first version of Chainventory, including the main modules required for the system.

### Major Changes

* Initialized the Next.js project
* Added application layout and global styles
* Added Chainventory logo assets
* Added Chainventory shell and navigation
* Added shared Chainventory UI components
* Added dashboard page
* Added Supabase client and server helpers
* Added authentication components
* Added login page and authentication actions
* Added login and register routes
* Added password input component
* Added password reset script
* Added chainsaw registration pages
* Added chainsaw registration form
* Added chainsaw records page and client
* Added reports page and components
* Added reports pie graph and clean report actions
* Updated project dependencies and configuration
* Removed unused settings component
* Deployed the application through Vercel

### Completed Features

* User login
* User registration
* Protected dashboard access
* Chainsaw registration
* Chainsaw records listing
* Record details viewing
* Record editing
* Record deletion
* Proof of ownership image upload
* Inspection images upload
* Reports and analytics
* Supabase database integration
* Vercel deployment
* Responsive interface for desktop and mobile screens

### Known Issues

* Mobile responsiveness required further adjustment after testing.

### Available in Next Builds/Releases

* Bug fixes and responsiveness improvements.

## Important Links

* GitHub Repository: github.com/SethAlmazan/silent-index
* Deployed App: https://silent-index.vercel.app/

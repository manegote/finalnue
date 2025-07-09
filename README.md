# Static Website with Admin Panel

This is a static website with a comprehensive admin panel for managing projects and gallery content. The admin panel generates complete files that you can copy and paste to update your website.

## How It Works

1. **Use the Admin Panel**: Open `admin.html` in your browser to manage content
2. **Add/Edit Content**: Create projects, gallery items, and configure website settings
3. **Generate Files**: Use the "Generate Files" tab to create complete HTML and JS files
4. **Copy & Paste**: Copy the generated code and save it to the appropriate files

## Admin Panel Features

### 📁 Projects Management

- Add, edit, and delete projects
- Set project status, categories, and relationships
- Rich markdown content editing
- Project relationships (parent/child projects)
- Technologies, challenges, and outcomes tracking

### 🖼️ Gallery Management

- Add, edit, and delete gallery images
- Categorize images (Photos, Designs, PCBs, Mockups, Parts)
- Tag system for better organization
- Link images to projects
- Bulk management capabilities

### ⚙️ Website Settings

- Site name, description, and branding
- Logo and footer customization
- Meta keywords for SEO
- Color scheme configuration
- Author information

### 🚀 File Generation

- **projects.html**: Complete projects page with all data
- **gallery.html**: Complete gallery page with all data
- **project-detail.js**: JavaScript with embedded project data
- **gallery.js**: JavaScript with embedded gallery data

## Usage Workflow

1. **Open Admin Panel**: Open `admin.html` in any browser
2. **Manage Content**: Add your projects and gallery images
3. **Configure Settings**: Set up your website branding and settings
4. **Generate Files**: Go to "Generate Files" tab and generate the files you need
5. **Update Website**: Copy the generated code and save it to your website files

## File Structure

```
static/
├── admin.html              # Admin panel interface
├── admin.js                # Admin panel functionality
├── projects.html           # Projects page (replace with generated)
├── gallery.html            # Gallery page (replace with generated)
├── project-detail.html     # Project detail page template
├── project-detail.js       # Project detail JS (replace with generated)
├── gallery.js              # Gallery JS (replace with generated)
├── projects.js             # Projects page functionality
├── styles.css              # Website styles
└── README.md               # This file
```

## Generated Files

The admin panel generates complete, self-contained files:

- **projects.html**: Includes all project cards with current data
- **gallery.html**: Includes all gallery items with current data
- **project-detail.js**: Contains project data and all functionality
- **gallery.js**: Contains gallery data and all functionality

## Benefits

✅ **Pure Static**: No server required, works with any hosting  
✅ **Easy Management**: User-friendly admin interface  
✅ **Complete Generation**: Generates entire files, not just data  
✅ **No Dependencies**: Admin panel works offline  
✅ **Version Control Friendly**: Generated files can be committed to git  
✅ **Fast Loading**: All data is embedded, no API calls needed

## Development Tips

- Keep a backup of your admin.html file as it contains all your data
- Use the backup feature regularly to save your work
- The admin panel stores data in browser localStorage between sessions
- Generated files are complete and ready to use immediately
- You can customize the generated templates by modifying the admin.js generator functions

This approach gives you the power of a CMS with the simplicity and performance of a static website!

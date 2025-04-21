const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const Project = require("./components/User/project");
const Skill = require("./components/User/skills");
const cors=require('cors')
dotenv.config();

const app = express();
app.use(cors());
const port = process.env.PORT || 8888;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Set up template engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Serve static files
app.use(express.static(path.join(__dirname, "public/css")));

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", require("./components/User/routes"));

// Post request for adding skills
app.post('/skills/add', (req, res) => {
  const { name, level } = req.body;

  const newSkill = new Skill({
    name,
    level,
  });

  newSkill.save()
    .then(() => res.redirect('/skills'))
    .catch((err) => res.status(500).send('Error adding skill'));
});

// Post request for adding projects
app.post('/projects/add', (req, res) => {
  const { name, description, tech } = req.body;

  const newProject = new Project({
    name,
    description,
    tech,
  });

  newProject.save()
    .then(() => res.redirect('/projects'))
    .catch((err) => res.status(500).send('Error adding project'));
});

// Routes to render views
app.get("/", (req, res) => {
  res.render("index");
});

app.get('/add-project', (req, res) => {
  res.render('project/add-project');
});

app.get('/add-skill', (req, res) => {
  res.render("skill/add-skill");
});

// API route for getting skills
app.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find();
    console.log("Fetched Skills", skills);
    res.render('skill/skills', { skills: skills || [] });
  } catch (err) {
    console.error("Error fetching skills", err);
    res.status(500).send('Error retrieving skills');
  }
});

// API route for deleting skills
app.post('/skills/:id/delete', async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.redirect('/skills');
  } catch (err) {
    console.error('Error deleting Skill:', err);
    res.status(500).send('Error deleting Skill');
  }
});

// API route for getting skills in JSON
app.get('/skills/api', async (req, res) => {
  try {
    const skills = await Skill.find();
    console.log("Fetched Skills", skills);
    res.json(skills); // Send the JSON response
  } catch (err) {
    console.error("Error fetching skills", err);
    res.status(500).send('Error retrieving skills');
  }
});

// API route for getting projects
app.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    console.log("Fetched Projects:", projects);
    res.render('project/projects', { projects: projects || [] });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).send('Error retrieving projects');
  }
});

// API route for deleting projects
app.post('/projects/:id/delete', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.redirect('/projects'); // Redirect back to the project list
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).send('Error deleting project');
  }
});

// API route for getting projects in JSON
app.get('/projects/api', async (req, res) => {
  try {
    const projects = await Project.find();
    console.log("Fetched Projects:", projects);
    res.json(projects); // Send the JSON response
  } catch (err) {
    console.error("Error fetching projects", err);
    res.status(500).send('Error retrieving projects');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

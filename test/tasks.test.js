const request = require('supertest');
const express = require('express');
const tasksRouter = require('../routes/tasks');

const app = express();
app.use(express.json());
app.use('/tasks', tasksRouter);

describe('Tasks API', function() {
  describe('GET /tasks', function() {
    it('should return all tasks', function(done) {
      request(app)
        .get('/tasks')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          if (!Array.isArray(res.body)) return done(new Error('Response is not an array'));
          done();
        });
    });
  });

  describe('POST /tasks', function() {
    it('should create a new task with valid title', function(done) {
      const newTask = { 
        title: 'Test Task', 
        desc: 'Test Desc', 
        category: 'Test' 
        };
      request(app)
        .post('/tasks')
        .send(newTask)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          if (!res.body || res.body.title !== newTask.title) return done(new Error('Task not created correctly'));
          done();
        });
    });
    it('should return 400 if title is missing', function(done) {
      request(app)
        .post('/tasks')
        .send({ desc: 'No title' })
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          if (!res.body.error) return done(new Error('No error message for missing title'));
          done();
        });
    });
  });

  describe('DELETE /tasks/:id', function() {
    it('should delete a task by id', function(done) {
      // First, create a task to delete
      const tempTask = { title: 'Delete Me' };
      request(app)
        .post('/tasks')
        .send(tempTask)
        .end(function(err, res) {
          if (err) return done(err);
          const id = res.body.taskId;
          request(app)
            .delete(`/tasks/${id}`)
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              if (!res.body || res.body.taskId !== id) return done(new Error('Task not deleted'));
              done();
            });
        });
    });
    it('should return 404 for non-existent task', function(done) {
      request(app)
        .delete('/tasks/99999')
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          if (!res.body.error) return done(new Error('No error message for non-existent task'));
          done();
        });
    });
  });

  describe('PUT /tasks/:id', function() {
    it('should update a task title by id', function(done) {
      // First, create a task to update
      const tempTask = { title: 'Update Me' };
      request(app)
        .post('/tasks')
        .send(tempTask)
        .end(function(err, res) {
          if (err) return done(err);
          const id = res.body.taskId;
          const updatedData = { title: 'Updated Title' };
          request(app)
            .put(`/tasks/${id}`)
            .send(updatedData)
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              if (!res.body || res.body.title !== updatedData.title) return done(new Error('Task not updated correctly'));
              done();
            });
        });
    });
    it('should return 404 for non-existent task', function(done) {
      request(app)
        .put('/tasks/99999')
        .send({ title: 'Does Not Exist' })
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          if (!res.body.error) return done(new Error('No error message for non-existent task'));
          done();
        });
    });
    it('should update a task\'s isCompleted by id', function(done) {
      // First, create a task to update
      const tempTask = { title: 'Complete Me' };
      request(app)
        .post('/tasks')
        .send(tempTask)
        .end(function(err, res) {
          if (err) return done(err);
          const id = res.body.taskId;
          const updatedData = { isCompleted: true };
          request(app)
            .put(`/tasks/${id}`)
            .send(updatedData)
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              if (!res.body || res.body.isCompleted !== updatedData.isCompleted) return done(new Error('Task not updated correctly'));
              done();
            });
        });
    });
    it('should update task with correct updatedAt timestamp', function(done) {
      // First, create a task to update
      const tempTask = { title: 'Timestamp Test' };
      request(app)
        .post('/tasks')
        .send(tempTask)
        .end(function(err, res) {
          if (err) return done(err);
          const id = res.body.taskId;
          const originalUpdatedAt = new Date(res.body.updatedAt);
          setTimeout(() => {
            const updatedData = { title: 'Timestamp Updated' };
            request(app)
              .put(`/tasks/${id}`)
              .send(updatedData)
              .expect(200)
              .end(function(err, res) {
                if (err) return done(err);
                const newUpdatedAt = new Date(res.body.updatedAt);
                if (newUpdatedAt <= originalUpdatedAt) return done(new Error('updatedAt timestamp not updated correctly'));
                done();
              });
          }, 1000); // Wait 1 second to ensure timestamp difference
        });
    });
  });

  describe('GET /tasks/:id', function() {
    it('should return a single task by id', function(done) {
      // First, create a task to fetch
      const tempTask = { title: 'Single Task', desc: 'Fetch me!' };
      request(app)
        .post('/tasks')
        .send(tempTask)
        .end(function(err, res) {
          if (err) return done(err);
          const id = res.body.taskId;
          request(app)
            .get(`/tasks/${id}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              if (!res.body || res.body.title !== tempTask.title) return done(new Error('Did not return the correct task'));
              done();
            });
        });
    });
    it('should return 404 for non-existent task', function(done) {
      request(app)
        .get('/tasks/99999')
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          if (!res.body.error) return done(new Error('No error message for non-existent task'));
          done();
        });
    });
  });
});

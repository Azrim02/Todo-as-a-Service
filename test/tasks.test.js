const request = require('supertest');
const express = require('express');
const tasksRouter = require('../routes/tasks');

const app = express();
app.use(express.json());
app.use('/tasks', tasksRouter);

describe('Tasks API', function() {
    describe('Validation for startDate and dueDate', function() {
      it('should return 400 if dueDate is before startDate on POST', function(done) {
        const newTask = {
          title: 'Invalid Dates',
          startDate: '2026-02-20T10:00:00Z',
          dueDate: '2026-02-19T10:00:00Z'
        };
        request(app)
          .post('/tasks')
          .send(newTask)
          .expect(400)
          .end(function(err, res) {
            if (err) return done(err);
            if (!res.body.error) return done(new Error('No error message for dueDate before startDate'));
            done();
          });
      });
      it('should return 400 if startDate is present but dueDate is missing on POST', function(done) {
        const newTask = {
          title: 'Missing Due Date',
          startDate: '2026-02-20T10:00:00Z'
        };
        request(app)
          .post('/tasks')
          .send(newTask)
          .expect(400)
          .end(function(err, res) {
            if (err) return done(err);
            if (!res.body.error) return done(new Error('No error message for missing dueDate'));
            done();
          });
      });
      it('should allow dueDate without startDate on POST', function(done) {
        const newTask = {
          title: 'Due Date Only',
          dueDate: '2026-02-21T10:00:00Z'
        };
        request(app)
          .post('/tasks')
          .send(newTask)
          .expect(201)
          .end(function(err, res) {
            if (err) return done(err);
            if (!res.body ) return done(new Error('No task returned'));
            if (res.body.dueDate !== new Date(newTask.dueDate).toISOString()) {
              return done(new Error(`dueDate not set correctly. Expected dueDate ${newTask.dueDate} but got ${res.body.dueDate}`));
            }
            done();
          });
      });
      it('should return 400 if dueDate is before startDate on PUT', function(done) {
        // First, create a valid task
        const tempTask = { title: 'Update Dates', startDate: '2026-02-20T10:00:00Z', dueDate: '2026-02-22T10:00:00Z' };
        request(app)
          .post('/tasks')
          .send(tempTask)
          .end(function(err, res) {
            if (err) return done(err);
            const id = res.body.taskId;
            // Try to update with invalid dates
            request(app)
              .put(`/tasks/${id}`)
              .send({ startDate: '2026-02-23T10:00:00Z', dueDate: '2026-02-22T10:00:00Z' })
              .expect(400)
              .end(function(err, res) {
                if (err) return done(err);
                if (!res.body.error) return done(new Error('No error message for dueDate before startDate on PUT'));
                done();
              });
          });
      });
      it('should return 400 if startDate is present but dueDate is missing on PUT', function(done) {
        // First, create a valid task
        const tempTask = { title: 'Update Missing Due', startDate: '2026-02-20T10:00:00Z', dueDate: '2026-02-22T10:00:00Z' };
        request(app)
          .post('/tasks')
          .send(tempTask)
          .end(function(err, res) {
            if (err) return done(err);
            const id = res.body.taskId;
            // Try to update with missing dueDate
            request(app)
              .put(`/tasks/${id}`)
              .send({ startDate: '2026-02-23T10:00:00Z' })
              .expect(400)
              .end(function(err, res) {
                if (err) return done(err);
                if (!res.body.error) return done(new Error('No error message for missing dueDate on PUT'));
                done();
              });
          });
      });
      it('should allow dueDate without startDate on PUT', function(done) {
        // First, create a valid task
        const tempTask = { title: 'Update Due Only', dueDate: '2026-02-22T10:00:00Z' };
        request(app)
          .post('/tasks')
          .send(tempTask)
          .end(function(err, res) {
            if (err) return done(err);
            const id = res.body.taskId;
            // Update with only dueDate
            request(app)
              .put(`/tasks/${id}`)
              .send({ dueDate: '2026-02-23T10:00:00Z' })
              .expect(200)
              .end(function(err, res) {
                if (err) return done(err);
                if (!res.body || res.body.dueDate !== '2026-02-23T10:00:00Z') return done(new Error('dueDate not updated correctly'));
                done();
              });
          });
      });
    });
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
    it('should set createdAt to the current time when a new task is created', function(done) {
      const newTask = { title: 'CreatedAt Test' };
      const before = new Date();
      request(app)
        .post('/tasks')
        .send(newTask)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          if (!res.body || !res.body.createdAt) return done(new Error('createdAt not set'));
          const createdAt = new Date(res.body.createdAt);
          const after = new Date();
          if (createdAt < before || createdAt > after) {
            return done(new Error('createdAt is not within the expected time window'));
          }
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
    it('should update a task\'s completedAt timestamp when marked as completed', function(done) {
      // First, create a task to update
      const tempTask = { title: 'Complete Timestamp Test' };
      request(app)
        .post('/tasks')
        .send(tempTask)
        .end(function(err, res) {
          if (err) return done(err);
          const id = res.body.taskId;
          const updatedData = { isCompleted: true };
          // mark it as completed and check completedAt timestamp
          request(app)
            .put(`/tasks/${id}`)
            .send(updatedData)
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              if (!res.body || !res.body.completedAt) return done(new Error('completedAt timestamp not set when task marked as completed'));
              done();
            });
        });
    });
    it('should clear completedAt timestamp when marked as not completed', function(done) {
      // First, create a task and mark it as completed
      const tempTask = { title: 'Uncomplete Timestamp Test' };
      request(app)
        .post('/tasks')
        .send(tempTask)
        .end(function(err, res) {
          if (err) return done(err);
          const id = res.body.taskId;
          // mark it as completed
          request(app)
            .put(`/tasks/${id}`)
            .send({ isCompleted: true })
            .end(function(err, res) {
              if (err) return done(err);
              if (!res.body || !res.body.completedAt) return done(new Error('completedAt timestamp not set when task marked as completed'));
              // Now mark it as not completed
              request(app)
                .put(`/tasks/${id}`)
                .send({ isCompleted: false })
                .expect(200)
                .end(function(err, res) {
                  if (err) return done(err);
                  if (!res.body || res.body.completedAt !== null) return done(new Error('completedAt timestamp not cleared when task marked as not completed'));
                  done();
                });
            });
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

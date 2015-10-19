var Subjects = require('./models/SubjectViews');

module.exports = function(app) {

  // server routes ===========================================================
  // handle things like api calls
  // authentication routes  
  // sample api route
 app.get('/api/data', function(req, res) {
  // use mongoose to get all nerds in the database
  Subjects.find({}, { '_id': 0, 'week': 1, 'prod_category': 1, 'customer_source': 1, 'customer_state': 1, 'gender': 1, 'cust_new_or_return': 1, 'sales_price': 1, 'sales_count': 1}, function(err, subjectDetails) {
   // if there is an error retrieving, send the error. 
       // nothing after res.send(err) will execute '_id': 0,
   if (err) 
   res.send(err);
    res.json(subjectDetails); // return all nerds in JSON format
  });
 });

 



 // frontend routes =========================================================
 app.get('*', function(req, res) {
  res.sendfile('./public/login.html');
 });
}
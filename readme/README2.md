# ExpressJS Workshop for DecodeMTL Full-Stack Bootcamp
*Your express way to the web development world!*

## Basic instructions
* :warning: :warning: **Do this workshop in the same Cloud9 workspace as your Reddit API.**
* Different exercises will require different NPM packages. This will require you to use `npm install --save` to get these packages.
* An **`index.js`** file is made available to you. It contains the code to load the Express library and make a server that listens to the correct port for Cloud 9. You can copy the code as an easy way to get started :)

## Exercise 1: Getting started!
Create a web server that can listen to requests for `/hello`, and respond with some HTML that says `<h1>Hello World!</h1>`

## Exercise 2: A wild query has appeared!
Create a web server that can listen to requests for `/hello?name=firstName`, and respond with some HTML that says `<h1>Hello _name_!</h1>`. For example, if a client requests `/hello?name=John`, the server should respond with `<h1>Hello John!</h1>`.

**REMEMBER: THE QUERY STRING IS NOT PART OF THE RESOURCE PATH THAT YOU ARE FILTERING WITH EXPRESS, JUST USE THE SAME `app.get('/hello')` AS EX 1**

## Exercise 2B: A wild param has appeared!
For this exercise, we will do the same thing as exercise 2 but with a URL parameter rather than a query string parameter. You will have to create a new `app.get` handler, and the code inside will be a tiny bit different from exercise 2.

There is however a conceptual difference between a query string parameter and a URL parameter. A URL parameter is part of the resource, and is usually required. Together with the fixed part of the URL, it represents a resource. In contrast, a query string parameter is more like the parameters of a function. Sometimes it's optional, and it doesn't define a specific resource by itself. We'll talk more about this in the coming days.

## Exercise 3: Operations
Create a web server that can listen to requests for `/calculator/:operation?num1=XX&num2=XX` and respond with a JSON object that looks like the following. For example, `/op/add?num1=31&num2=11`:
```json
{
  "operator": "add",
  "firstOperand": 31,
  "secondOperand": 11,
  "solution": 42
}
```

**NOTE**: **query string parameters** -- the part after the `?` in a URL -- are different conceptually from the **request parameters**, which are part of the path. For example here you are asked to use `:operation` as request parameter. In express, you do this by making your `app.get('/op/:operation', ...)`. The `:` before `operation` will tell Express that this is a **request parameter**. You can access it using the `request.params` object instead of `request.query` which would be for the query string. In general, while the query string is reserved for either optional values or values that can vary wildly, we will use request parameters when they can themselves represent a resource. Here, we are looking for the `calculator` resource, and under it for the `add` "sub-resource". Of course this is our own terminology and in general it's up to us to decide what our URL schema represents.

Your program should work for `add`,`sub`,`mult`,`div` and return the appropriate solution in a JSON string. If `operation` is 
other than these 4 values, you should use [`res.status`](http://expressjs.com/4x/api.html#res.status) to send an appropriate [error code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html). First, figure out the category of error code you need to send, then find an appropriate code using the provided link.

## Exercise 4: Retrieving data from our database
Before doing this exercise, go back to your reddit clone MySQL database from the CLI. Using a few `INSERT` statements, put up a few posts in the `posts` table. Have at least 10-15 posts in there with various `title`s and `url`s. For the `userId`, set it to 1. Also create a user with ID 1 and call him John Smith or something.

Once you have inserted a few posts in the database, it's now time to retrieve the contents from our web server and display them to the user using an HTML `<ul>` list with a bunch of `<li>`s.

Using your `getAllPosts` function from RedditAPI, retrieve the latest 5 posts by `createdAt` date, including the username who created the content.

Once you have the query, create an endpoint in your Express server which will respond to `GET` requests to `/posts`. The Express server will use the MySQL query function to retrieve the array of contents. Then, you should build a string of HTML that you will send with the `request.send` function.

Your HTML should look like the following:

```html
<div id="contents">
  <h1>List of contents</h1>
  <ul class="contents-list">
    <li class="content-item">
      <h2 class="content-item__title">
        <a href="http://the.post.url.value/">The content title</a>
      </h2>
      <p>Created by CONTENT AUTHOR USERNAME</p>
    </li>
    ... one <li> per content that your SQL query found
  </ul>
</div>
```

## Exercise 5: Creating a "new content" form
In this exercise, we're going to use Express to simply send an HTML file to our user containing a `<form>`. To do this, let's write a little HTML form that looks like this:

```html
<form action="/createContent" method="POST"> <!-- what is this method="POST" thing? you should know, or ask me :) -->
  <div>
    <input type="text" name="url" placeholder="Enter a URL to content">
  </div>
  <div>
    <input type="text" name="title" placeholder="Enter the title of your content">
  </div>
  <button type="submit">Create!</button>
</form>
```

You can use template strings (with backticks) to write the HTML code directly in your web server file on multiple lines. Then, using ExpressJS create a **`GET`** endpoint called `createContent`. When someone requests this URL, send the HTML form to them as a string with `res.send`.

:warning: This exercise is EASY. Don't look too much into it. It's only a preparation for the next exercise. It's almost as easy as exercise 1. All you have to do is send some static HTML as a response.

## Exercise 6: Receiving data from our form
In this exercise, we will write our first `POST` endpoint. The resource will be the same, `/createContent`, but we will be writing a second endpoint using `app.post` instead.

In the code of `app.post('/createContent')`, we will be receiving the form data from step 5. This will get sent by the browser when the user presses the submit button. The form will instruct the browser to make a `POST` request (because of the `method`), and the resource will be `/createContent` because of the `action` parameter.

To parse this data into our request, the easiest way is to have an [ExpressJS middleware](http://expressjs.com/en/guide/using-middleware.html). Start by reading up about middleware and what they do. We will talk about them more in detail in further lectures.

One particular middleware, called [Express bodyParser](https://github.com/expressjs/body-parser) can make sense of form data that is sent by a browser. Before reading the form data, you will have to install the bodyParser middleware with NPM, require it in your server code, then load it with `app.use`.

Form data is sent by default using the **urlencoded** format. The documentation explains [how to make bodyParser read urlencoded request body](https://github.com/expressjs/body-parser#bodyparserurlencodedoptions). After adding this middleware, the form data will be available thru `req.body`. Start by doing a `console.log` of it to see what you get.

Once you are familiar with the contents of `req.body`, use your `createPost` function from RedditAPI to create a new post that has the URL and Title passed to you in the HTTP request. For the moment, set the user as being ID#1, or "John Smith".

Once the data is inserted successfully, you have a few choices of what to do in your callback:

1. Use `response.send("OK")` to tell the browser that everything went well
2. Use `response.send` to send the actual post object that was created (received from the `createPost` function)
3. Use `response.redirect` to send the user back to the `/posts` page you setup in a previous exercise
4. **challenge :)** Using a `response.redirect`, redirect the user to the URL `/posts/:ID` where `:ID` is the ID of the newly created post. This is more challenging because now you have to implement the `/posts/:ID` URL! See if you can do that and return a single post only.

## Exercise 7: Using a template engine
Tomorrow, we will learn about ExpressJS template engines in class. Template engines are useful if we want to send some HTML to the browser, which is often the case in a regular web server.

The simplest way to send HTML to the browser is to use `response.send`, and pass it a string of HTML. This is what you had to do for exercises 4 and 5, and it has a few disadvantages:

  * The HTML is mixed up with the web server code, which is less than ideal. It makes it harder to see the logic of the web server.
  * Generating dynamic HTML can be tedious and error-prone: you have to do string concatenation, close your tags properly, and be sure to escape your HTML to avoid injection attacks.
  * Every time you want to change the HTML code, you have to restart your web server. While this may not be a huge issue, it can be avoided if the HTML is in a separate file.

There exist tons of different template engines that work with Express. The idea behind a template engine is super simple: it's a function that takes some data, and returns some text -- most often HTML -- based on the so-called template. The difference between the various template engines that exist is the syntax they use for expressing the transformation of data to HTML.

Once you know one or two template languages, learning new ones is quite easy. For this course, we're going to use the [Pug template engine](http://pugjs.org), which was previously known as Jade.

The goal of this exercise is to practice writing Pug templates, to get us ready for our big Reddit Clone project. To do this, we're going to use Pug to refactor exercises 4 and 5.

Here are the steps to follow:

  1. From your terminal, install the `pug` NPM package.
  2. From your `index.js` file, set Express to use the Pug engine by adding the following line:

  ```js
  app.set('view engine', 'pug');
  ```
  3. In your project, create a directory called `views`. This is where Express will look for your templates.
  4. Create a new file called `create-content.pug` in the `views` directory.
  5. Paste the following content in the file:

  ```pug
  form(action="/createContent", method="POST")
    div
      input(type="text", name="url", placeholder="Enter a URL to content")
    div
      input(type="text", name="title", placeholder="Enter the title of your content")
    button(type="submit") Create!
  ```
  6. Notice how the Pug code is much shorter than its HTML counterpart? This is because Pug uses indentation rather than opening and closing tags. This template actually has no dynamic parts to it, but it's still nicer to write it than the HTML document, and it's separated from the web server code! 
  7. In your `app.get('/createContent')` code, remove all the HTML you created, as well as the `res.send`. Replace them with the following single line of code:

  ```js
  res.render('create-content');
  ```
  8. Restart your web server and verify that you are getting the same HTML.
  9. Let's do the same thing for Exercise 4. This time, we have some dynamic data. We will need to loop through the array of posts and display it using a Pug template.
    1. Read the [documentation on iteration with Pug](https://pugjs.org/language/iteration.html). We're interested in the `each` loop here. Make sure you understand how it works.
    2. In your web server code, inside the `app.get('/posts')` code, replace the manual rendering with a call like this:

      ```js
      res.render('post-list', {posts: posts});
      ```
    3. In your views directory, create a file called `post-list.pug` and try to recreate the same output as you did with HTML. You will have access to a variable called `posts`, that will have been transmitted by the call to `render`. You will need to use the `each` functionality of Pug to do this.

## Exercise 8: Layouts
This exrcise expands on the previous one. In the previous exercise, we saw how to generate dynamic HTML by using a template engine. This is great, but normally we have to send a **full HTML page** rather than a part of a page.

Pug lets us do this using [inheritance](https://pugjs.org/language/inheritance.html). We start by defining a "layout", which is simply a template with some placeholders. Then, when we render our main template -- the one you created in the previous exercise -- we specify how the placeholders should be filled in.

For this exercise, we're going to create a basic layout. In your `views` directory, create a file called `layout.pug` with the following content:

```pug
doctype html
html
  head
    meta(charset="utf-8")
    block title
      title The Default Title
  body
    block content
```

Then, modify your `post-list.pug` from the previous step to use this layout. To do this, you'll have to add one `extends` line at the top of your file, and move the rest of the template inside a block. If you are unsure how to do this, make sure to read the documentation about [extends](https://pugjs.org/language/extends.html) and inheritance.

Hint: This should not be more complicated than adding a line or two, and indenting some code!

## CHALLENGE: Let's add a bit of CSS!
Now that you have a layout for your "site", you should easily be able to include a CSS file :)

In the `head` section of your layout, add the following line:

```pug
link(rel="stylesheet", href="/files/styles.css")
```

That was the easy part. If you have done this correctly, when you refresh the `/posts` page your browser will try to load a file `/files/styles.css` from your web server. This will result in a 404 error, because your server doesn't know how to respond to this request -- yet!

In your project, create a directory called `static_files`, and inside create an empty file called `styles.css`.

Now we have to figure out how to make your web server serve this file. Tomorrow, we will learn about ExpressJS middleware, functions that can respond to requests without any intervention from your part. One such middleware is the [static middleware](https://expressjs.com/en/starter/static-files.html). You can point it to a directory on your computer, and it will automatically "`res.send`" any file that is requested from this directory.

For this challenge, you have to figure out by yourself how to add the static middleware to your web server. Your middleware should only be active if the URL starts with `/files`, and it should look in the `static_files` directory for any file that matches. This way, when your browser requests the URL `/files/styles.css`, your middleware should be able to send the file called `styles.css` under the `static_files` directory. Note that the name of the directory and the path prefix in the URL are not related to each other.

## You are too good for this!
Well, it seems like the day has not ended and you finished everything. Watch this [course from Google on Client-Server communication on Udacity](https://classroom.udacity.com/courses/ud897) to advance your understanding of HTTP!

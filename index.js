"use strict";

const async = require("async");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const path = require("path");
const app = express();
const port = 3000;

const createReadStream = require("fs").createReadStream;
const sleep = require("util").promisify(setTimeout);

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    swaggerDefinition: {
      info: {
        title: "Computer Vision API",
        version: "1.0.0",
        description: "Computer Vision API autogenerated by Swagger",
      },
      host: "localhost:3000",
      basePath: "/",
    },
    apis: ["./index.js"],
  };

const specs = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));


const ComputerVisionClient = require("@azure/cognitiveservices-computervision")
  .ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

app.use(cors());

app.use(bodyParser.json());

//post request CV API 

/**
 * @swagger
 * definitions:
 *   textData:
 *     properties:
 *       url:
 *         type: string
 */ 

/**
 * @swagger
 * /imageDescription:
 *    post:
 *      description: Gets the list of generated captions for the image
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: detailed description of the image with confidence score
 *          400:
 *              description: Bad Request or Invalid URL
 *          500:
 *              description: Internal Server Error
 *      parameters:
 *          - name: url
 *            description: Request object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/textData'
 *
 */

app.post("/imageDescription", async (req, res, next) => {
  let url = req.body.url;
  if(req.body == null || req.body == undefined || req.body.url == undefined  || req.body.url == null){
    return res.status(400).json('Bad request');
  }
  var caption;
  await async.series(
    [
      async function () {
        const describeURL = url;
        console.log(
          "Analyzing URL image to describe...",
          describeURL.split("/").pop()
        );
        caption = (await computerVisionClient.describeImage(describeURL))
          .captions[0];
        console.log(
          `This may be ${caption.text} (${caption.confidence.toFixed(
            2
          )} confidence)`
        );
        res.status(200).json(caption);
      },
      function () {
        return new Promise((resolve) => {
          resolve();
        });
      },
    ],
    (error) => {
      res.status(error.statusCode).json({
        error
    })
    }
  );
});

//post request CV API 

/**
 * @swagger
 * definitions:
 *   textData:
 *     properties:
 *       url:
 *         type: string
 */ 

/**
 * @swagger
 * /imageCategory:
 *    post:
 *      description: Gets the detected category of the image
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: category of the image with confidence score
 *          400:
 *              description: Bad Request or Invalid URL
 *          500:
 *              description: Internal Server Error
 *      parameters:
 *          - name: url
 *            description: Request object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/textData'
 *
 */

app.post("/imageCategory", async (req, res, next) => {
  let url = req.body.url;
  if(req.body == null || req.body == undefined || req.body.url == undefined  || req.body.url == null){
    return res.status(400).json('Bad request');
  }
  var categories;
  await async.series(
    [
      async function () {


        const categoryURLImage = url;

        // Analyze URL image
        console.log('Analyzing category in image...', categoryURLImage.split('/').pop());

        categories = (await computerVisionClient.analyzeImage(categoryURLImage)).categories;

        console.log(`Categories: ${formatCategories(categories)}`);

        res.status(200).json(categories);
      },
      function () {
        return new Promise((resolve) => {
          resolve();
        });
      },
    ],
    (error) => {
      res.status(error.statusCode).json({
        error
    })
    }
  );
});

//post request CV API 

/**
 * @swagger
 * definitions:
 *   textData:
 *     properties:
 *       url:
 *         type: string
 */ 

/**
 * @swagger
 * /imageTags:
 *    post:
 *      description: Gets the set of detected tags in the image
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Gets the set of detected tags in the image with confidence score
 *          400:
 *              description: Bad Request or Invalid URL
 *          500:
 *              description: Internal Server Error
 *      parameters:
 *          - name: url
 *            description: Request object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/textData'
 *
 */

app.post("/imageTags", async (req, res, next) => {
  let url = req.body.url;
  if(req.body == null || req.body == undefined || req.body.url == undefined  || req.body.url == null){
    return res.status(400).json('Bad request');
  }
  var tags;
  await async.series(
    [
      async function () {


        console.log('-------------------------------------------------');
        console.log('DETECT TAGS');
        console.log();

        // Image of different kind of dog.
        const tagsURL = url;

        // Analyze URL image
        console.log('Analyzing tags in image...', tagsURL.split('/').pop());
        tags = (await computerVisionClient.analyzeImage(tagsURL, { visualFeatures: ['Tags'] })).tags;
        console.log(`Tags: ${formatTags(tags)}`);
        res.status(200).json(tags);
      },
      function () {
        return new Promise((resolve) => {
          resolve();
        });
      },
    ],
    (error) => {
        res.status(error.statusCode).json({
            error
        })
    }
  );
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

/**
 * AUTHENTICATE
 * This single client is used for all examples.
 */
const key = "c9ed04c88004402b8020d7a05bbed819";
const endpoint = "https://comp-ak-vision.cognitiveservices.azure.com/";

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);

// Formats the image categories
function formatCategories(categories) {
  categories.sort((a, b) => b.score - a.score);
  return categories.map(cat => `${cat.name} (${cat.score.toFixed(2)})`).join(', ');
}

// Format tags for display
function formatTags(tags) {
  return tags.map(tag => (`${tag.name} (${tag.confidence.toFixed(2)})`)).join(', ');
}

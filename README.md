#  light-workflow-js

A library to create, run and orchestrate AWS SWF workflow.
Written in TypeScript and heavily relies on RxJS. 

[Documentation](https://adamrecsko.github.io/light-workflow-js/) - You can find a documentation here


## Getting Started
```
  $ git clone https://github.com/adamrecsko/light-workflow-js.git
  $ cd light-workflow-js
  $ yarn install
```


### Prerequisites

You need node.js and yarn to be installed before start.

```
    $ apt-get install nodejs
    $ npm install yarn -g
```



For running a workflow on AWS you need aws credentials properly setup on your development environment
and a registered AWS SWF domain.

## Running the tests

```
    $ yarn test
```


### Running linter

Explain what these tests test and why

```
   $ yarn lint
```


## Built With

* [RxJS](http://reactivex.io/rxjs/)
* [TypeScript](http://www.typescriptlang.org/)
* [yarn](https://yarnpkg.com/lang/en/)
* [Zone.js](https://github.com/angular/zone.js)


## Authors

* **Adam Recsko** - *Initial work* 


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* This library is under development and not production ready yet.

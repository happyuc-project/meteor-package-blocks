/**

 @module Happyuc:blocks
 */

/**
 The HucBlocks collection, with some happyuc additions.

 @class HucBlocks
 @constructor
 */

HucBlocks = new Mongo.Collection('happyuc_blocks', {connection: null});

// if(typeof PersistentMinimongo !== 'undefined')
//     new PersistentMinimongo(HucBlocks);

/**
 Gives you reactively the lates block.

 @property latest
 */
Object.defineProperty(HucBlocks, 'latest', {
  get: function() {
    return HucBlocks.findOne({}, {sort: {number: -1}}) || {};
  },
  set: function(values) {
    var block = HucBlocks.findOne({}, {sort: {number: -1}}) || {};
    values = values || {};
    HucBlocks.update(block._id, {$set: values});
  },
});

/**
 Stores all the callbacks

 @property _forkCallbacks
 */
HucBlocks._forkCallbacks = [];

/**
 Start looking for new blocks

 @method init
 */
HucBlocks.init = function() {
  if (typeof webu === 'undefined') {
    console.warn(
        'HucBlocks couldn\'t find webu, please make sure to instantiate a webu object before calling HucBlocks.init()',
    );
    return;
  }

  // clear current block list
  HucBlocks.clear();

  Tracker.nonreactive(function() {
    observeLatestBlocks();
  });
};

/**
 Add callbacks to detect forks

 @method detectFork
 */
HucBlocks.detectFork = function(cb) {
  HucBlocks._forkCallbacks.push(cb);
};

/**
 Clear all blocks

 @method clear
 */
HucBlocks.clear = function() {
  _.each(HucBlocks.find({}).fetch(), function(block) {
    HucBlocks.remove(block._id);
  });
};

/**
 The global block filter instance.

 @property filter
 */
var filter = null;

/**
 Update the block info and adds additional properties.

 @method updateBlock
 @param {Object} block
 */
function updateBlock(block) {
  // reset the chain, if the current blocknumber is 100 blocks less
  if (block.number + 10 < HucBlocks.latest.number) HucBlocks.clear();

  block.difficulty = block.difficulty.toString(10);
  block.totalDifficulty = block.totalDifficulty.toString(10);

  webu.huc.getGasPrice(function(e, gasPrice) {
    if (!e) {
      block.gasPrice = gasPrice.toString(10);
      HucBlocks.upsert(
          'bl_' + block.hash.replace('0x', '').substr(0, 20),
          block,
      );
    }
  });
}

/**
 Observe the latest blocks and store them in the Blocks collection.
 Additionally cap the collection to 50 blocks

 @method observeLatestBlocks
 */
function observeLatestBlocks() {
  // get the latest block immediately
  webu.huc.getBlock('latest', function(e, block) {
    if (!e) {
      updateBlock(block);
    }
  });

  // GET the latest blockchain information
  filter = webu.huc.filter('latest').watch(checkLatestBlocks);
}

/**
 The observeLatestBlocks callback used in the block filter.

 @method checkLatestBlocks
 */
var checkLatestBlocks = function(e, hash) {
  if (!e) {
    webu.huc.getBlock(hash, function(e, block) {
      if (!e) {
        var oldBlock = HucBlocks.latest;

        // console.log('BLOCK', block.number);

        // if(!oldBlock)
        //     console.log('No previous block found: '+ --block.number);

        // CHECK for FORK
        if (oldBlock && oldBlock.hash !== block.parentHash) {
          // console.log('FORK detected from Block #'+ oldBlock.number + ' -> #'+ block.number +'!');

          _.each(HucBlocks._forkCallbacks, function(cb) {
            if (_.isFunction(cb)) cb(oldBlock, block);
          });
        }

        updateBlock(block);
        // drop the 50th block
        var blocks = EthBlocks.find({}, {sort: {number: -1}}).fetch();
        if (blocks.length >= 5) {
          var count = 0;
          _.each(blocks, function(bl) {
            count++;
            if (count >= 5)
              EthBlocks.remove({_id: bl._id});
          });
        }
      }
    });
  } else {
    filter.stopWatching();
    filter = webu.huc.filter('latest').watch(checkLatestBlocks);
  }
};

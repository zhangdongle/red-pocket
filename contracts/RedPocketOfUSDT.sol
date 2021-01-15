pragma solidity ^0.5.1;

import './Ownable.sol';
import './Base.sol';

contract RedPocketOfUSDT is Ownable, Base{
  
      // test
    Erc20Token internal _usdtIns;

    constructor (address[10] memory companyAddress, address[5] memory techAddress, address token, uint256 baseAmount, uint8 fiveCount) Ownable() public {
        _companyAddresses = companyAddress;
        _techAddresses = techAddress;
        _usdtIns = Erc20Token(token);
        _baseAmount = baseAmount;
        _fiveCount = fiveCount;
        for(uint64 i = 0;i<companyAddress.length;i++){
          _uid ++;
          register(_uid,companyAddress[i],address(0));
        }
        for(uint64 i = 0;i<techAddress.length;i++){
          _uid ++;
          register(_uid,techAddress[i],address(0));
        }
    }

    // struct RedPocket{
    //   uint128 id; // 红包ID
    //   address from; // 红包发送者
    //   address to; // 红包接收者
    //   uint8 level; // 红包的等级
    // }

    struct Player{
      uint64 id; // 用户ID
      address referer; // 推荐人
      // address lastRecipient; // 上次接收红包的地址
      uint8 level;// 用户级别
      uint64[] directPushs; // 直推人信息
      // uint64[] sendList; // 发出去的红包接收者
      // uint64[] receivedList; // 接收到的红包发送者ID
      uint64 receivedCount;
    }

    uint64 _rotationId; // 轮循ID，捡漏红包总数 retationId = companyId + techId;
    uint64 _companyId; // 公司轮循ID
    uint64 _techId; // 技术轮循ID
    uint64 public _uid; // 用户总ID
    uint128 public _pid; // 红包总ID

    mapping(uint64=>address) public _playerMap; // 以id为key存储id和地址的对应关系
    mapping(address=>Player) public _players;// 以address为key存储用户的信息

    // mapping(address=>uint64[]) msg.senders; // 某个地址发送的所有红包地址，1个人最多发送11个红包，可以按照下标来获取上级推荐人
    // mapping(address=>uint64[]) _recipients; // 某个地址接收的所有红包地址
    // uint256 public _baseUnit = 10 ** 6; // USDT精度
    uint8 constant private _companyCount = 10; // 公司地址数量
    uint8 constant private _techCount = 5; // 技术地址数量
    uint8 constant private _addressCount = _companyCount + _techCount;// 总的捡漏地址数量
    uint8 constant private _companyRate = 9; // 公司地址捡漏比例 9 代表 9:1
    uint8 private _fiveCount; // 5级达标人数
    // uint256 public _techFee = (30 / 10000) * 10 ** 18 ; // 技术服务费（万分位）

    address[10] private _companyAddresses; // 公司合约地址
    address[5] private _techAddresses; // 技术分红地址
    uint256 public _baseAmount; // 游戏基数

    struct RedPocket{
      uint64 from; // 红包发送者
      uint64 to; // 红包接收者
    }

    mapping(uint128=>RedPocket) public _redPocketMap;
    
    // address payable receiver = address(this);

    function setBaseAmount(uint256 baseAmount) onlyOwner public {
      _baseAmount = baseAmount;
    }

    /**
     * 发送红包
     * 推荐人
     */
    function sendPocket(address  refAddress) canUpgrade() public payable {
      Player memory player = _players[msg.sender];
      
      // id = 0, 表示用户不存在，id > 0 && 小于等于 15 表示是技术分红地址
      // require(_player.id == 0 || _player.id > 15,"illegal address")
      // 当前玩家星级，0级、4级分别需要查到上面第5级和第9级的用户
      uint8 level = player.level;
      uint8 nextLevel = level + 1;

      address recipient;
      address fiveReferer;
      // 代表该玩家不存在
      if(player.id == 0){
        // 玩家数量加1
        _uid ++;
        Player memory referer = _players[refAddress];
        // 如果推荐人是0地址则代表没有推荐人
        if(referer.id == 0){
          register(_uid,msg.sender,address(0));
          recipient = getRotationAddress();
        } else {
          register(_uid,msg.sender,refAddress);
          recipient = refAddress;
        }
      }else{
        recipient = getNextLevelRecipient(player.referer, nextLevel, nextLevel);
      }
      if(level == 0 || level == 4){
        if(_players[recipient].id > _addressCount){
          // 升1级和升5级，要给5级和9级红包，相当于是上一级0->1、4->5，再加4处理
          // 直接用下一级的接收者+4，可以节省前面轮循的4次
          fiveReferer = getNextLevelRecipient(recipient, 5, nextLevel + 4);
        }else{
          fiveReferer = getRotationAddress();
        }
        // 转账给5级接收者
        transfer(msg.sender,fiveReferer, _baseAmount);
      }
      // 用户升一级
      _players[msg.sender].level += 1;
      // 转账给接收者
      transfer(msg.sender,recipient, _baseAmount);
      // this.send(_techFee);
    }

    function transfer(address from, address to ,uint value) private {
      _pid ++;
      // _players[from].sendList.push(_players[to].id);
      // _players[to].receivedList.push(_players[from].id);
      _redPocketMap[_pid].from = _players[from].id;
      _redPocketMap[_pid].to = _players[to].id;
      _players[to].receivedCount+=1;
      _usdtIns.transferFrom(from, to, value);
    }

    /**
    * 检查玩家是否可以升级
     */
    modifier canUpgrade(){
      uint8 level = _players[msg.sender].level;
      // ETH版本需要打开这个验证
      // if(level==0 || level == 4){
      //   require(msg.value == _baseAmount*2, "The amount is wrong");
      // }
      if(level == 1){
        // 推荐3个玩家
        require(_players[msg.sender].directPushs.length >= 3, "Not up to standard");
      }else if(level == 4){
        // 下线已经推荐了81个玩家
        uint8 maxDepth = 4; // 最大深度，即往下查几代
        uint8 depth = 1;
        uint256 count = statisticDirectPushCount(_players[msg.sender].id,depth,maxDepth);
        require(count >= _fiveCount, "Not up to standard");
      }      
      _;
    }

    /**
    * 递归函数，查询一个地址下面人脉数
    * uid 玩家ID
    * depth 传入玩家的相对深度
    * maxDepth 查询的最大深度
    */
    function statisticDirectPushCount(uint64 uid,uint8 depth,uint8 maxDepth) view public returns(uint256){
      uint64[] memory arr = _players[_playerMap[uid]].directPushs;
      uint256 count = arr.length;
      if(depth >= maxDepth || count == 0){
        return count;
      }
      depth ++ ;
      for(uint8 i = 0; i < arr.length ; i++){
        count = count + statisticDirectPushCount(arr[i], depth, maxDepth);
      }
      return count;
    }

    /**
    * [0]玩家ID
    * [1]玩家邀请人
    * [2]玩家等级level
    * [3]玩家直推人[]
    * [4]人脉总数
    * [5]各级人数[]
    * [6]发送出去的红包接收者[]
    * [7]收到的红包发送者[]
     */
    // function getPlayerInfo() view public returns(uint64,address,uint8,uint64[] memory,uint256,uint256[9] memory,uint64[] memory,uint64[] memory){
    function getPlayerInfo() view public returns(uint64,address,uint8,uint64[] memory,uint256,uint256[9] memory,uint64){
      Player memory player = _players[msg.sender];
      // 获取9个等级的人数
      uint256[9] memory levelCount;
      uint256 totalCount = 0;
      uint256 count;
      for(uint8 i = 1; i <= 9; i++){
        count = statisticDirectPushCount(player.id, 1, i);
        count = count - totalCount;
        levelCount[i-1] = count;
        totalCount += count;
      }
      // return (player.id,player.referer,player.level,player.directPushs,totalCount,levelCount,player.sendList,player.receivedList);
      return (player.id,player.referer,player.level,player.directPushs,totalCount,levelCount,player.receivedCount);
    }

    /**
    * 获取下一级接收者
    * addr 该玩家的推荐人地址（省一个轮循）
    * level 玩家的下一级别
    * standardLevel 接收者的级别要求
     */
    function getNextLevelRecipient(address addr ,uint8 level,uint8 standardLevel) private returns(address){
      for(int i = 1 ;i < level; i++){
        addr = _players[addr].referer;
        if(_players[addr].id == 0){
          // 获取捡漏地址
          return getRotationAddress();
        }
      }
      if(_players[addr].level < standardLevel){
        return getRotationAddress();
      }
      return addr;
    }

    // 注册玩家信息
    function register(uint64 uid, address sender, address referer) private {
      // uint64[] memory arr;
      if(_players[referer].id != 0){
        _players[referer].directPushs.push(uid);
        _players[sender].referer = referer;
      }
      // Player memory player = Player(uid,referer,1,arr);
      _players[sender].id = uid;
      _players[sender].level = 0;
      _playerMap[uid]=sender;
    }

    /**
    * 获取轮循库中的地址
    */
    function getRotationAddress() private returns(address){
      _rotationId ++;
      // 一个技术地址得红包
      if(_rotationId % _companyRate == 0){
        _techId ++;
        return _techAddresses[_techId % _techCount];
      }else{
        _companyId ++;
        return _companyAddresses[_companyId % _companyCount];
      }
    }

    function () external payable {}
}
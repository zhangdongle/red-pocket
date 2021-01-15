pragma solidity ^0.5.1;

// import './Ownable.sol';
// import './Base.sol';

contract RedPocket is Ownable, Base{
  
    constructor (address[10] memory companyAddress, address[5] memory techAddress) Ownable() public {
        _companyAddresses = companyAddress;
        _techAddresses = techAddress;
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
    }

    uint64 _rotationId; // 轮循ID，捡漏红包总数 retationId = companyId + techId;
    uint64 _companyId; // 公司轮循ID
    uint64 _techId; // 技术轮循ID
    uint64 public _uid; // 用户总ID
    uint128 _pid; // 红包总ID

    mapping(uint64=>address) _playerMap; // 以id为key存储id和地址的对应关系
    mapping(address=>Player) _players;// 以address为key存储用户的信息

    // mapping(address=>uint64[]) msg.senders; // 某个地址发送的所有红包地址，1个人最多发送11个红包，可以按照下标来获取上级推荐人
    // mapping(address=>uint64[]) _recipients; // 某个地址接收的所有红包地址
    uint256 public _baseUnit = 10 ** 6; // USDT精度
    uint8 constant private _companyCount = 10; // 公司地址数量
    uint8 constant private _techCount = 5; // 技术地址数量
    uint8 constant private _addressCount = _companyCount + _techCount;// 总的捡漏地址数量
    uint8 constant private _companyRate = 10; // 技术地址捡漏比例 10 代表 1/10
    uint256 public _techFee = (30 / 10000) * 10 ** 18 ; // 技术服务费（万分位）

    address[10] private _companyAddresses; // 公司合约地址
    address[5] private _techAddresses; // 技术分红地址
    uint256 public _baseAmount = 10 * _baseUnit; // 游戏基数（10USDT）
    
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
      Player memory referer = _players[refAddress];
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
        // 如果推荐人是0地址则代表没有推荐人
        if(referer.id == 0){
          recipient = getRotationAddress();
        } else {
          recipient = refAddress;
        }
        // 发送给推荐人1个，发送给上面第5级一个
        if(referer.id > 0){
          register(_uid,refAddress);
        }else{
          register(_uid,address(0));
        }
      }else{
        recipient = getNextLevelRecipient(msg.sender, nextLevel, 5);
      }
      if(level == 0 || level == 4){
        if(_players[recipient].id > _addressCount){
          // 升1级和升5级，要给5级和9级红包，相当于是上一级0->1、4->5，再加4处理
          fiveReferer = getNextLevelRecipient(recipient, 4, 9);
        }else{
          fiveReferer = getRotationAddress();
        }
        // 转账给5级接收者
        // _usdtIns.transfer(fiveReferer, _baseAmount);
        address(uint160(fiveReferer)).transfer(_baseAmount);
      }
      // 用户升一级
      _players[msg.sender].level += 1;
      // 转账给接收者
      // _usdtIns.transfer(recipient, _baseAmount);
      // 扣除ETH手续费
      // this.send(_techFee);
      address(uint160(recipient)).transfer(_baseAmount);
    }

    /**
    * 检查玩家是否可以升级
     */
    modifier canUpgrade(){
      uint8 level = _players[msg.sender].level;
      if(level==0 || level == 4){
        require(msg.value == _baseAmount*2, "The amount is wrong");
      }
      if(level == 1){
        // 推荐3个玩家
        require(_players[msg.sender].directPushs.length >= 3, "Not up to standard");
      }else if(level == 4){
        // 下线已经推荐了81个玩家
        uint64 count = uint64(_players[msg.sender].directPushs.length);
        uint8 maxDepth = 4; // 最大深度，即往下查几代
        uint8 depth = 1;
        count = count + statisticDirectPushCount(_players[msg.sender].directPushs,1,4);
        require(count >= 81, "Not up to standard");
      }      
      _;
    }

    /**
    * 递归函数，查询一个地址下面所有直推人
    * arr 玩家ID（uid）集合
    * depth 传入玩家的相对深度
    * 查询的最大深度
    */
    function statisticDirectPushCount(uint64[] memory arr,uint8 depth,uint8 maxDepth) view public returns(uint64){
      if(depth > maxDepth){
        return 0;
      }
      depth ++ ;
      uint64 count = 0;
      for(uint8 i = 0; i < arr.length ; i++){
        Player memory dpPlayer = _players[_playerMap[arr[i]]];
        count = count + statisticDirectPushCount(dpPlayer.directPushs, depth, maxDepth);
      }
      return count;
    }

    function getPlayerInfo() view public returns(uint64,address,uint8,uint64[] memory,uint64,uint64[9] memory){
      Player memory player = _players[msg.sender];
      // 获取9个等级的人数
      uint64[9] memory levelCount;
      uint64 totalCount = uint64(player.directPushs.length);
      for(uint8 i = 0; i< 9; i++){
        uint64 count = this.statisticDirectPushCount(player.directPushs, 0, i);
        totalCount += count;
        levelCount[i] = count;
      }
      return (player.id,player.referer,player.level,player.directPushs,totalCount,levelCount);
    }

    /**
    * 获取下一级接收者
     */
    function getNextLevelRecipient(address addr ,uint8 level,uint8 standardLevel) private returns(address){
      for(int i = 0 ;i < level; i++){
          Player memory player = _players[addr];
          if(player.id == 0){
            // 获取捡漏地址
            return getRotationAddress();
          }
          addr = player.referer;
      }
      if(_players[addr].level < standardLevel){
        return getRotationAddress();
      }
      return addr;
    }

    // 注册玩家信息
    function register(uint64 uid, address referer) private {
      // uint64[] memory arr;
      if(_players[referer].id != 0){
        _players[referer].directPushs.push(uid);
        _players[msg.sender].referer = referer;
      }
      // Player memory player = Player(uid,referer,1,arr);
      _players[msg.sender].id = uid;
      _players[msg.sender].level = 0;
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
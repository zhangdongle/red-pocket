pragma solidity ^0.5.16;
import "./SafeMath.sol";

interface Erc20Token {
     function totalSupply() external view returns (uint256);
     function balanceOf(address _who) external view returns (uint256);
     function transfer(address _to, uint256 _value) external;
     function allowance(address _owner, address _spender) external view returns (uint256);
     function transferFrom(address _from, address _to, uint256 _value) external;
     function approve(address _spender, uint256 _value) external;
     function burn(uint256 amount) external;
     function getLastBurnTime(address _who) external view returns(uint256);
}

// 基类合约
contract Base {
    using SafeMath for uint;

    // USDT汇率换算，USDT的精度是6，所以乘以1000000
    
    function usdtConvert(uint256 value) internal pure returns(uint256) {
        return value.mul(1000000);
    }

    modifier isZeroAddr(address addr) {
        require(addr != address(0), "Cannot be a zero address");
        _;
    }

    // receive() external payable {}

}
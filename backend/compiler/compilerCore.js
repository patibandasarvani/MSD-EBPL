class TokenType {
  static CREATE = 'CREATE';
  static VARIABLE = 'VARIABLE';
  static WITH = 'WITH';
  static VALUE = 'VALUE';
  static SET = 'SET';
  static TO = 'TO';
  static IF = 'IF';
  static THEN = 'THEN';
  static ELSE = 'ELSE';
  static END = 'END';
  static PRINT = 'PRINT';
  static IS_GREATER_THAN = 'IS_GREATER_THAN';
  static IS_LESS_THAN = 'IS_LESS_THAN';
  static IS_EQUAL_TO = 'IS_EQUAL_TO';
  static IS_NOT_EQUAL_TO = 'IS_NOT_EQUAL_TO';
  static AND = 'AND';
  static OR = 'OR';
  static NOT = 'NOT';
  static WHILE = 'WHILE';
  static DO = 'DO';
  static EQUALS = 'EQUALS';
  static PLUS = 'PLUS';
  static MINUS = 'MINUS';
  static MULTIPLY = 'MULTIPLY';
  static DIVIDE = 'DIVIDE';
  static IDENTIFIER = 'IDENTIFIER';
  static NUMBER = 'NUMBER';
  static STRING = 'STRING';
  static LPAREN = 'LPAREN';
  static RPAREN = 'RPAREN';
  static NEWLINE = 'NEWLINE';
  static EOF = 'EOF';
}

class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
  
  toString() {
    return `Token(${this.type}, '${this.value}', ${this.line}:${this.column})`;
  }
}

class Lexer {
  constructor(sourceCode) {
    this.sourceCode = sourceCode;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    
    // Define keywords and operators with their patterns
    this.keywords = {
      'create': TokenType.CREATE,
      'variable': TokenType.VARIABLE,
      'with': TokenType.WITH,
      'value': TokenType.VALUE,
      'set': TokenType.SET,
      'to': TokenType.TO,
      'if': TokenType.IF,
      'then': TokenType.THEN,
      'else': TokenType.ELSE,
      'end': TokenType.END,
      'print': TokenType.PRINT,
      'while': TokenType.WHILE,
      'do': TokenType.DO,
      'and': TokenType.AND,
      'or': TokenType.OR,
      'not': TokenType.NOT
    };
    
    this.multiWordOperators = {
      'is greater than': TokenType.IS_GREATER_THAN,
      'is less than': TokenType.IS_LESS_THAN,
      'is equal to': TokenType.IS_EQUAL_TO,
      'is not equal to': TokenType.IS_NOT_EQUAL_TO
    };
  }

  tokenize() {
    while (this.position < this.sourceCode.length) {
      const char = this.sourceCode[this.position];
      
      // Skip whitespace (but not newlines)
      if (char === ' ' || char === '\t') {
        this.advance();
        continue;
      }
      
      // Handle newlines
      if (char === '\n') {
        this.tokens.push(new Token(TokenType.NEWLINE, '\n', this.line, this.column));
        this.advance();
        continue;
      }
      
      // Handle numbers
      if (this.isDigit(char)) {
        this.tokenizeNumber();
        continue;
      }
      
      // Handle strings
      if (char === '"') {
        this.tokenizeString();
        continue;
      }
      
      // Handle identifiers and keywords
      if (this.isAlpha(char)) {
        this.tokenizeIdentifier();
        continue;
      }
      
      // Handle operators and symbols
      if (this.isOperator(char)) {
        this.tokenizeOperator();
        continue;
      }
      
      // Handle parentheses
      if (char === '(') {
        this.tokens.push(new Token(TokenType.LPAREN, '(', this.line, this.column));
        this.advance();
        continue;
      }
      
      if (char === ')') {
        this.tokens.push(new Token(TokenType.RPAREN, ')', this.line, this.column));
        this.advance();
        continue;
      }
      
      // If we get here, it's an unexpected character
      throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
    }
    
    this.tokens.push(new Token(TokenType.EOF, '', this.line, this.column));
    return this.tokens;
  }

  tokenizeNumber() {
    let number = '';
    let hasDecimal = false;
    
    while (this.position < this.sourceCode.length) {
      const char = this.sourceCode[this.position];
      
      if (this.isDigit(char)) {
        number += char;
        this.advance();
      } else if (char === '.' && !hasDecimal) {
        number += char;
        hasDecimal = true;
        this.advance();
      } else {
        break;
      }
    }
    
    this.tokens.push(new Token(TokenType.NUMBER, number, this.line, this.column));
  }

  tokenizeString() {
    let string = '';
    this.advance(); // Skip opening quote
    
    while (this.position < this.sourceCode.length) {
      const char = this.sourceCode[this.position];
      
      if (char === '"') {
        this.advance(); // Skip closing quote
        break;
      }
      
      if (char === '\n') {
        throw new Error('Unterminated string literal');
      }
      
      string += char;
      this.advance();
    }
    
    this.tokens.push(new Token(TokenType.STRING, string, this.line, this.column));
  }

  tokenizeIdentifier() {
    let identifier = '';
    
    while (this.position < this.sourceCode.length) {
      const char = this.sourceCode[this.position];
      
      if (this.isAlphaNumeric(char)) {
        identifier += char;
        this.advance();
      } else {
        break;
      }
    }
    
    // Check for multi-word operators first
    const remainingText = this.sourceCode.substring(this.position);
    for (const [operator, tokenType] of Object.entries(this.multiWordOperators)) {
      if (remainingText.startsWith(operator)) {
        // We have a multi-word operator, push the first word as identifier
        // and the operator as a separate token
        this.tokens.push(new Token(TokenType.IDENTIFIER, identifier, this.line, this.column));
        this.tokens.push(new Token(tokenType, operator, this.line, this.column));
        this.advanceMultiple(operator.length);
        return;
      }
    }
    
    // Check if it's a keyword
    const lowerIdentifier = identifier.toLowerCase();
    if (this.keywords[lowerIdentifier]) {
      this.tokens.push(new Token(this.keywords[lowerIdentifier], identifier, this.line, this.column));
    } else {
      this.tokens.push(new Token(TokenType.IDENTIFIER, identifier, this.line, this.column));
    }
  }

  tokenizeOperator() {
    const char = this.sourceCode[this.position];
    
    switch (char) {
      case '+':
        this.tokens.push(new Token(TokenType.PLUS, '+', this.line, this.column));
        break;
      case '-':
        this.tokens.push(new Token(TokenType.MINUS, '-', this.line, this.column));
        break;
      case '*':
        this.tokens.push(new Token(TokenType.MULTIPLY, '*', this.line, this.column));
        break;
      case '/':
        this.tokens.push(new Token(TokenType.DIVIDE, '/', this.line, this.column));
        break;
      case '=':
        this.tokens.push(new Token(TokenType.EQUALS, '=', this.line, this.column));
        break;
      default:
        throw new Error(`Unknown operator '${char}' at line ${this.line}, column ${this.column}`);
    }
    
    this.advance();
  }

  isDigit(char) {
    return char >= '0' && char <= '9';
  }

  isAlpha(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
  }

  isAlphaNumeric(char) {
    return this.isAlpha(char) || this.isDigit(char);
  }

  isOperator(char) {
    return ['+', '-', '*', '/', '='].includes(char);
  }

  advance(count = 1) {
    for (let i = 0; i < count; i++) {
      if (this.position < this.sourceCode.length) {
        if (this.sourceCode[this.position] === '\n') {
          this.line++;
          this.column = 1;
        } else {
          this.column++;
        }
        this.position++;
      }
    }
  }

  advanceMultiple(count) {
    this.advance(count);
  }
}

// AST Nodes
class ASTNode {}

class Program extends ASTNode {
  constructor(statements) {
    super();
    this.statements = statements;
  }
  
  toString() {
    return `Program(${this.statements.map(stmt => stmt.toString()).join(', ')})`;
  }
}

class VariableDeclaration extends ASTNode {
  constructor(identifier, value) {
    super();
    this.identifier = identifier;
    this.value = value;
  }
  
  toString() {
    return `VariableDeclaration(${this.identifier}, ${this.value})`;
  }
}

class PrintStatement extends ASTNode {
  constructor(expression) {
    super();
    this.expression = expression;
  }
  
  toString() {
    return `PrintStatement(${this.expression})`;
  }
}

class NumberLiteral extends ASTNode {
  constructor(value) {
    super();
    this.value = value;
  }
  
  toString() {
    return `NumberLiteral(${this.value})`;
  }
}

class StringLiteral extends ASTNode {
  constructor(value) {
    super();
    this.value = value;
  }
  
  toString() {
    return `StringLiteral("${this.value}")`;
  }
}

class Identifier extends ASTNode {
  constructor(name) {
    super();
    this.name = name;
  }
  
  toString() {
    return `Identifier(${this.name})`;
  }
}

class BinaryOperation extends ASTNode {
  constructor(left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  
  toString() {
    return `BinaryOperation(${this.left}, '${this.operator}', ${this.right})`;
  }
}

class Comparison extends ASTNode {
  constructor(left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  
  toString() {
    return `Comparison(${this.left} ${this.operator} ${this.right})`;
  }
}

class LogicalOperation extends ASTNode {
  constructor(left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  
  toString() {
    return `LogicalOperation(${this.left} ${this.operator} ${this.right})`;
  }
}

class IfStatement extends ASTNode {
  constructor(condition, thenBranch, elseBranch = null) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
  
  toString() {
    return `IfStatement(${this.condition}, then=${this.thenBranch.length}, else=${this.elseBranch ? this.elseBranch.length : 0})`;
  }
}

class WhileLoop extends ASTNode {
  constructor(condition, body) {
    super();
    this.condition = condition;
    this.body = body;
  }
  
  toString() {
    return `WhileLoop(${this.condition}, body=${this.body.length})`;
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.currentToken = null;
    this.position = -1;
    this.advance();
  }

  advance() {
    this.position++;
    if (this.position < this.tokens.length) {
      this.currentToken = this.tokens[this.position];
    } else {
      this.currentToken = null;
    }
  }

  expect(tokenType) {
    if (this.currentToken && this.currentToken.type === tokenType) {
      const result = this.currentToken;
      this.advance();
      return result;
    } else {
      const expected = tokenType;
      const actual = this.currentToken ? this.currentToken.type : 'EOF';
      throw new Error(`Expected ${expected}, got ${actual} at line ${this.currentToken?.line}`);
    }
  }

  parse() {
    const statements = [];
    
    while (this.currentToken && this.currentToken.type !== TokenType.EOF) {
      // Skip newlines between statements
      if (this.currentToken.type === TokenType.NEWLINE) {
        this.advance();
        continue;
      }
      
      const statement = this.parseStatement();
      if (statement) {
        statements.push(statement);
      }
      
      // Skip newlines after statements
      while (this.currentToken && this.currentToken.type === TokenType.NEWLINE) {
        this.advance();
      }
    }
    
    return new Program(statements);
  }

  parseStatement() {
    if (!this.currentToken) return null;
    
    switch (this.currentToken.type) {
      case TokenType.CREATE:
        return this.parseVariableDeclaration();
      case TokenType.PRINT:
        return this.parsePrintStatement();
      case TokenType.IF:
        return this.parseIfStatement();
      case TokenType.WHILE:
        return this.parseWhileLoop();
      default:
        throw new Error(`Unexpected token in statement: ${this.currentToken.type}`);
    }
  }

  parseVariableDeclaration() {
    this.expect(TokenType.CREATE);
    this.expect(TokenType.VARIABLE);
    
    const identifier = this.expect(TokenType.IDENTIFIER);
    this.expect(TokenType.WITH);
    this.expect(TokenType.VALUE);
    
    const value = this.parseExpression();
    
    return new VariableDeclaration(identifier.value, value);
  }

  parsePrintStatement() {
    this.expect(TokenType.PRINT);
    const expression = this.parseExpression();
    return new PrintStatement(expression);
  }

  parseExpression() {
    return this.parseLogicalExpression();
  }

  parseLogicalExpression() {
    let left = this.parseComparison();
    
    while (this.currentToken && 
           (this.currentToken.type === TokenType.AND || 
            this.currentToken.type === TokenType.OR)) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseComparison();
      left = new LogicalOperation(left, operator, right);
    }
    
    return left;
  }

  parseComparison() {
    let left = this.parseAddition();
    
    while (this.currentToken && this.isComparisonOperator()) {
      let operator;
      
      switch (this.currentToken.type) {
        case TokenType.IS_GREATER_THAN:
          operator = '>';
          break;
        case TokenType.IS_LESS_THAN:
          operator = '<';
          break;
        case TokenType.IS_EQUAL_TO:
          operator = '==';
          break;
        case TokenType.IS_NOT_EQUAL_TO:
          operator = '!=';
          break;
        default:
          return left;
      }
      
      this.advance();
      const right = this.parseAddition();
      left = new Comparison(left, operator, right);
    }
    
    return left;
  }

  isComparisonOperator() {
    return this.currentToken && [
      TokenType.IS_GREATER_THAN,
      TokenType.IS_LESS_THAN,
      TokenType.IS_EQUAL_TO,
      TokenType.IS_NOT_EQUAL_TO
    ].includes(this.currentToken.type);
  }

  parseAddition() {
    let left = this.parseMultiplication();
    
    while (this.currentToken && 
           (this.currentToken.type === TokenType.PLUS || 
            this.currentToken.type === TokenType.MINUS)) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseMultiplication();
      left = new BinaryOperation(left, operator, right);
    }
    
    return left;
  }

  parseMultiplication() {
    let left = this.parsePrimary();
    
    while (this.currentToken && 
           (this.currentToken.type === TokenType.MULTIPLY || 
            this.currentToken.type === TokenType.DIVIDE)) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parsePrimary();
      left = new BinaryOperation(left, operator, right);
    }
    
    return left;
  }

  parsePrimary() {
    if (!this.currentToken) {
      throw new Error('Unexpected end of input');
    }
    
    const token = this.currentToken;
    
    switch (token.type) {
      case TokenType.NUMBER:
        this.advance();
        return new NumberLiteral(parseFloat(token.value));
        
      case TokenType.STRING:
        this.advance();
        return new StringLiteral(token.value);
        
      case TokenType.IDENTIFIER:
        this.advance();
        return new Identifier(token.value);
        
      case TokenType.LPAREN:
        this.advance();
        const expression = this.parseExpression();
        this.expect(TokenType.RPAREN);
        return expression;
        
      default:
        throw new Error(`Unexpected token in expression: ${token.type}`);
    }
  }

  parseIfStatement() {
    this.expect(TokenType.IF);
    const condition = this.parseLogicalExpression();
    this.expect(TokenType.THEN);
    
    // Parse then branch
    const thenBranch = [];
    while (this.currentToken && 
           this.currentToken.type !== TokenType.END && 
           this.currentToken.type !== TokenType.ELSE &&
           this.currentToken.type !== TokenType.EOF) {
      if (this.currentToken.type === TokenType.NEWLINE) {
        this.advance();
        continue;
      }
      thenBranch.push(this.parseStatement());
    }
    
    // Parse else branch if present
    let elseBranch = null;
    if (this.currentToken && this.currentToken.type === TokenType.ELSE) {
      this.advance();
      elseBranch = [];
      while (this.currentToken && 
             this.currentToken.type !== TokenType.END && 
             this.currentToken.type !== TokenType.EOF) {
        if (this.currentToken.type === TokenType.NEWLINE) {
          this.advance();
          continue;
        }
        elseBranch.push(this.parseStatement());
      }
    }
    
    this.expect(TokenType.END);
    this.expect(TokenType.IF);
    
    return new IfStatement(condition, thenBranch, elseBranch);
  }

  parseWhileLoop() {
    this.expect(TokenType.WHILE);
    const condition = this.parseLogicalExpression();
    this.expect(TokenType.DO);
    
    const body = [];
    while (this.currentToken && 
           this.currentToken.type !== TokenType.END && 
           this.currentToken.type !== TokenType.EOF) {
      if (this.currentToken.type === TokenType.NEWLINE) {
        this.advance();
        continue;
      }
      body.push(this.parseStatement());
    }
    
    this.expect(TokenType.END);
    this.expect(TokenType.WHILE);
    
    return new WhileLoop(condition, body);
  }
}

class EBPLCompiler {
  constructor() {
    this.tokens = [];
    this.ast = null;
    this.errors = [];
    this.generatedCode = '';
  }

  compile(sourceCode) {
    this.errors = [];
    try {
      // Lexical Analysis
      const lexer = new Lexer(sourceCode);
      this.tokens = lexer.tokenize();
      
      // Syntax Analysis
      const parser = new Parser(this.tokens);
      this.ast = parser.parse();
      
      // Code Generation
      this.generatedCode = this.generatePython();
      
      return { success: true };
    } catch (error) {
      console.error('Compilation error:', error);
      this.errors.push(error.message);
      return { success: false, error: error.message };
    }
  }

  generatePython() {
    if (!this.ast) return '';
    
    const lines = [
      "#!/usr/bin/env python3",
      "# Generated from EBPL",
      ""
    ];
    
    for (const statement of this.ast.statements) {
      const code = this.generateStatement(statement);
      if (code) {
        lines.push(code);
      }
    }
    
    return lines.join('\n');
  }

  generateStatement(node, indent = 0) {
    const indentStr = '    '.repeat(indent);
    
    if (node instanceof VariableDeclaration) {
      const valueCode = this.generateExpression(node.value);
      return `${indentStr}${node.identifier} = ${valueCode}`;
    }
    
    if (node instanceof PrintStatement) {
      const valueCode = this.generateExpression(node.expression);
      return `${indentStr}print(${valueCode})`;
    }
    
    if (node instanceof IfStatement) {
      const conditionCode = this.generateExpression(node.condition);
      const result = [`${indentStr}if ${conditionCode}:`];
      
      for (const stmt of node.thenBranch) {
        result.push(this.generateStatement(stmt, indent + 1));
      }
      
      if (node.elseBranch && node.elseBranch.length > 0) {
        result.push(`${indentStr}else:`);
        for (const stmt of node.elseBranch) {
          result.push(this.generateStatement(stmt, indent + 1));
        }
      }
      
      return result.join('\n');
    }
    
    if (node instanceof WhileLoop) {
      const conditionCode = this.generateExpression(node.condition);
      const result = [`${indentStr}while ${conditionCode}:`];
      
      for (const stmt of node.body) {
        result.push(this.generateStatement(stmt, indent + 1));
      }
      
      return result.join('\n');
    }
    
    return `${indentStr}# Unknown statement: ${node.constructor.name}`;
  }

  generateExpression(node) {
    if (node instanceof NumberLiteral) {
      return node.value.toString();
    }
    
    if (node instanceof StringLiteral) {
      return `"${node.value}"`;
    }
    
    if (node instanceof Identifier) {
      return node.name;
    }
    
    if (node instanceof BinaryOperation) {
      const left = this.generateExpression(node.left);
      const right = this.generateExpression(node.right);
      return `(${left} ${node.operator} ${right})`;
    }
    
    if (node instanceof Comparison) {
      const left = this.generateExpression(node.left);
      const right = this.generateExpression(node.right);
      return `(${left} ${node.operator} ${right})`;
    }
    
    if (node instanceof LogicalOperation) {
      const left = this.generateExpression(node.left);
      const right = this.generateExpression(node.right);
      const operator = node.operator === 'and' ? 'and' : 'or';
      return `(${left} ${operator} ${right})`;
    }
    
    return 'None';
  }

  getTokensDisplay() {
    return this.tokens
      .filter(token => token.type !== TokenType.NEWLINE && token.type !== TokenType.EOF)
      .map(token => `${token.type.padEnd(20)} -> '${token.value}' (line ${token.line})`);
  }

  getAstDisplay() {
    if (!this.ast) return ['No AST generated'];
    return this.ast.statements.map((stmt, i) => `Statement ${i + 1}: ${stmt}`);
  }
}

module.exports = { EBPLCompiler, TokenType, Token, Lexer, Parser };